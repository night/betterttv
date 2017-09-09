const api = require('./utils/api');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const SafeEventEmitter = require('./utils/safe-event-emitter');
const $ = require('jquery');

let route = '';
let chatWatcher;
let clipsChatWatcher;
let channel = {};
// const chatState = {
//     slow: 0,
//     emoteOnly: 0,
//     followersOnly: -1,
//     r9k: 0,
//     subsOnly: 0
// };

class Watcher extends SafeEventEmitter {
    constructor() {
        super();

        // load is deferred to allow for all modules to initialize first
        setTimeout(() => this.load());
    }

    load() {
        this.channelObserver();
        this.chatObserver();
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
        const router = twitch.getRouter();

        const onRouteChange = location => {
            debug.log(`New route: ${location.pathname}`);

            // trigger on all loads (like resize functions)
            this.emit('load');

            const lastRoute = route;
            route = location.pathname.split('/')[1];

            switch (route) {
                case '':
                    this.emit('load.frontpage');
                    break;
                case 'directory':
                    if (lastRoute === 'directory') break;
                    this.emit('load.directory.following');
                    break;
                default:
                    route = 'channel';
                    if (lastRoute === 'channel') break;
                    this.emit('load.channel');
                    this.emit('load.chat');
                    break;
            }
        };

        router.history.listen(location => onRouteChange(location));
        onRouteChange(router.history.location);
    }

    chatObserver() {
        const emitMessage = $el => {
            const msgObject = twitch.getChatMessageObject($el[0]);
            if (!msgObject) return;
            this.emit('chat.message', $el, msgObject);
        };

        // const emitStateChange = (caller, key) => {
        //     let newValue = caller[key];
        //     if (newValue === undefined || newValue === null) {
        //         return;
        //     }

        //     if (typeof newValue === 'boolean') {
        //         newValue = newValue === true ? 1 : 0;
        //     } else if (typeof newValue === 'string') {
        //         newValue = parseInt(newValue, 10);
        //     }

        //     chatState[key] = newValue;
        //     this.emit('chat.state', chatState);
        // };

        // const observeChatState = () => {
        //     const currentChat = twitch.getCurrentChat();
        //     if (!currentChat) return;
        //     Object.keys(chatState).forEach(key => {
        //         currentChat.addObserver(key, emitStateChange);
        //         emitStateChange(currentChat, key);
        //     });
        // };

        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});

            // late load messages events
            $(element).find('.chat-line__message').each((index, el) => emitMessage($(el)));

            // observeChatState();
        };

        chatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('chat__container')) {
                        this.emit('load.chat', true);
                    }

                    if ($el.hasClass('chat-line__message')) {
                        emitMessage($el);
                    }
                }
            })
        );

        this.on('load.chat', loaded => observe(chatWatcher, $(loaded ? '.chat__container' : '.channel__sidebar')[0]));
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

        clipsChatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('clip-chat-line')) {
                        this.emit('clips.message', $el);
                    }
                }
            })
        );

        this.on('load.clips', () => observe(clipsChatWatcher, $('body')[0]));
    }
}

module.exports = new Watcher();
