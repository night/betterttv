const api = require('./utils/api');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const SafeEventEmitter = require('./utils/safe-event-emitter');
const $ = require('jquery');

let route = '';
let chatWatcher;
let conversationWatcher;
let channel = {};
const chatState = {
    slow: 0,
    emoteOnly: 0,
    followersOnly: -1,
    r9k: 0,
    subsOnly: 0
};

class Watcher extends SafeEventEmitter {
    constructor() {
        super();

        // load is deferred to allow for all modules to initialize first
        setTimeout(() => this.load());
    }

    load() {
        this.channelObserver();
        this.chatObserver();
        this.conversationObserver();
        this.routeObserver();
        this.clipsChatObserver();
        this.checkClips();

        debug.log('Watcher started');
    }

    checkClips() {
        if (window.location.hostname !== 'clips.twitch.tv') return;
        this.emit('load.clips');
    }

    routeObserver() {
        if (!window.App || !window.Ember) return;

        let renderingCounter = 0;
        const waitForLoad = () => {
            return new Promise(resolve => {
                setTimeout(() => resolve(renderingCounter === 0 ? null : waitForLoad), 25);
            });
        };

        const onRouteChange = data => {
            if (data.currentRouteName === route) return;

            const lastRoute = route;
            route = data.currentRouteName;

            debug.log(`New route: ${route}`);

            waitForLoad().then(() => {
                debug.log(`Route loaded: ${route}`);

                // trigger on all loads (like resize functions)
                this.emit('load');

                switch (route) {
                    case 'loading':
                        break;

                    case 'index':
                        this.emit('load.frontpage');
                        break;
                    case 'chat':
                        this.emit('load.chat');
                        break;
                    case 'dashboards.index':
                        this.emit('load.dashboard');
                        this.emit('load.chat');
                        break;
                    case 'channel.videos.video-type':
                    case 'channel.followers':
                    case 'channel.following':
                    case 'channel.index.index':
                    case 'channel.clips':
                        this.emit('load.channel');
                        // Switching between tabs in channel page
                        if (lastRoute.substr(0, 8) === 'channel.') break;
                        this.emit('load.chat');
                        break;
                    case 'videos':
                        this.emit('load.vod');
                        this.emit('load.chat');
                        break;
                    case 'directory.following.index':
                        // Switching between tabs in following page
                        if (lastRoute.substr(0, 19) === 'directory.following') break;
                        this.emit('load.directory.following');
                        break;
                }
            });
        };

        const applicationController = window.App.__container__.lookup('controller:application');

        onRouteChange({currentRouteName: applicationController.get('currentRouteName')});
        applicationController.addObserver('currentRouteName', onRouteChange);

        Ember.subscribe('render', {
            before: () => {
                renderingCounter++;
            },
            after: () => {
                renderingCounter--;
            }
        });
    }

    chatObserver() {
        const emitMessage = $el => {
            const msgObject = twitch.getChatMessageObject($el[0]);
            if (!msgObject) return;
            this.emit('chat.message', $el, msgObject);
        };

        const emitStateChange = (caller, key) => {
            let newValue = caller[key];
            if (newValue === undefined || newValue === null) {
                return;
            }

            if (typeof newValue === 'boolean') {
                newValue = newValue === true ? 1 : 0;
            } else if (typeof newValue === 'string') {
                newValue = parseInt(newValue, 10);
            }

            chatState[key] = newValue;
            this.emit('chat.state', chatState);
        };

        const emitChatUnhiddenLoad = (caller, key) => {
            const value = caller[key];
            if (value === true) return;
            this.emit('load.chat');
        };

        const observeChatState = () => {
            const currentChat = twitch.getCurrentChat();
            if (!currentChat) return;
            Object.keys(chatState).forEach(key => {
                currentChat.addObserver(key, emitStateChange);
                emitStateChange(currentChat, key);
            });
        };

        const observeChatUnhide = () => {
            twitch.getChatController().addObserver('isChatHidden', emitChatUnhiddenLoad);
        };

        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});

            // late load messages events
            $(element).find('.chat-line').each((index, el) => emitMessage($(el)));

            // late load settings event
            if ($(element).find('.chat-settings').length) {
                this.emit('load.chat_settings');
            }

            observeChatState();
            observeChatUnhide();
        };

        chatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('chat-line')) {
                        if ($el.find('.horizontal-line').length) continue;
                        emitMessage($el);
                    }

                    if ($el.hasClass('chat-settings')) {
                        this.emit('load.chat_settings');
                    }
                }
            })
        );

        this.on('load.chat', () => observe(chatWatcher, $('.chat-room')[0]));
    }

    conversationObserver() {
        const observe = (watcher, element) => {
            // Element does not exist when the user is logged out
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});
        };

        conversationWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('conversation-window')) {
                        this.emit('conversation.new', $el);
                    } else if ($el.hasClass('conversation-chat-line')) {
                        const view = twitch.getEmberView($el.attr('id'));
                        this.emit('conversation.message', $el, view.message);
                    }
                }
            })
        );

        this.on('load', () => observe(conversationWatcher, $('.conversations-content')[0]));
    }

    channelObserver() {
        this.on('load.chat', () => {
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel) return;

            if (currentChannel.id === channel.id) return;
            channel = currentChannel;
            api
                .get(`channels/${channel.name}`)
                .then(d => this.emit('channel.updated', d));
        });
    }

    clipsChatObserver() {
        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});
        };

        conversationWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('clip-chat-line')) {
                        this.emit('clips.message', $el);
                    }
                }
            })
        );

        this.on('load.clips', () => observe(conversationWatcher, $('body')[0]));
    }
}

module.exports = new Watcher();
