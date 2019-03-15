const api = require('./utils/api');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const SafeEventEmitter = require('./utils/safe-event-emitter');
const $ = require('jquery');

const CLIPS_HOSTNAME = 'clips.twitch.tv';
const CANCEL_VOD_RECOMMENDATION_SELECTOR = '.recommendations-overlay .pl-rec__cancel.pl-button';
const CHAT_ROOM_SELECTOR = 'section[data-test-selector="chat-room-component-layout"]';

let router;
let currentPath = '';
let currentRoute = '';
let chatWatcher;
let vodChatWatcher;
let clipsChatWatcher;
let currentChatReference;
let currentChatChannelId;
let currentChannelId;
let channel = {};

const loadPredicates = {
    following: () => !!$('.following__header-tabs').length,
    channel: () => {
        const href = $('.channel-header__user-avatar img').attr('src') || $('h3[data-test-selector="side-nav-channel-info__name_link"] a').attr('href');
        const currentChannel = twitch.updateCurrentChannel();
        if (!currentChannel || !currentChannel.id || (currentChannelId && currentChannelId === currentChannel.id)) return false;
        currentChannelId = currentChannel.id;
        return !!href;
    },
    chat: context => {
        if (!twitch.updateCurrentChannel()) return false;

        if (!$(CHAT_ROOM_SELECTOR).length) return false;

        const lastReference = currentChatReference;
        const currentChat = twitch.getCurrentChat();
        if (!currentChat) return false;

        let checkReferences = true;
        if (context && context.forceReload) {
            if (context.checkReferences === undefined) {
                context.checkReferences = true;
            }
            checkReferences = context.checkReferences;
            context.checkReferences = false;
        }

        if (checkReferences) {
            if (currentChat === lastReference) return false;
            if (currentChat.props.channelID === currentChatChannelId) return false;
        }

        currentChatReference = currentChat;
        currentChatChannelId = currentChat.props.channelID;

        return true;
    },
    clips: () => twitch.updateCurrentChannel(),
    player: () => !!twitch.getCurrentPlayer(),
    vod: () => twitch.updateCurrentChannel() && $('.video-chat__input textarea').length,
    vodRecommendation: () => $(CANCEL_VOD_RECOMMENDATION_SELECTOR).length,
    homepage: () => !!$('.front-page-carousel .player-video').length
};

const routes = {
    HOMEPAGE: 'HOMEPAGE',
    DIRECTORY_FOLLOWING_LIVE: 'DIRECTORY_FOLLOWING_LIVE',
    DIRECTORY_FOLLOWING: 'DIRECTORY_FOLLOWING',
    DIRECTORY: 'DIRECTORY',
    CHAT: 'CHAT',
    CHANNEL: 'CHANNEL',
    DASHBOARD: 'DASHBOARD',
    VOD: 'VOD'
};

const routeKeysToPaths = {
    [routes.HOMEPAGE]: /^\/$/i,
    [routes.DIRECTORY_FOLLOWING_LIVE]: /^\/directory\/following\/live$/i,
    [routes.DIRECTORY_FOLLOWING]: /^\/directory\/following$/i,
    [routes.DIRECTORY]: /^\/directory/i,
    [routes.CHAT]: /^(\/popout)?\/[a-z0-9-_]+\/chat$/i,
    [routes.VOD]: /^(\/videos\/[0-9]+|\/[a-z0-9-_]+\/clip\/[a-z0-9-_]+)$/i,
    [routes.DASHBOARD]: /^\/[a-z0-9-_]+\/dashboard/i,
    [routes.CHANNEL]: /^\/[a-z0-9-_]+/i
};

function getRouteFromPath(path) {
    for (const name of Object.keys(routeKeysToPaths)) {
        const regex = routeKeysToPaths[name];
        if (!regex.test(path)) continue;
        return name;
    }

    return null;
}

class Watcher extends SafeEventEmitter {
    constructor() {
        super();

        if (window.location.hostname === CLIPS_HOSTNAME) {
            this.loadClips();
            return;
        }

        const loadInterval = setInterval(() => {
            let user;
            try {
                router = twitch.getRouter();
                const connectStore = twitch.getConnectStore();
                if (!connectStore || !router) {
                    debug.error('Initialization failed, missing : ', {connectStore, router});
                    return;
                }
                user = connectStore.getState().session.user;
            } catch (_) {
                return;
            }

            if (!router || !user) {
                debug.error('Initialization failed, missing : ', {router, user});
                return;
            }
            clearInterval(loadInterval);

            twitch.setCurrentUser(user.authToken, user.id, user.login, user.displayName);
            this.load();
        }, 25);
    }

    waitForLoad(type, context = null) {
        let timeout;
        let interval;
        const startTime = Date.now();
        return Promise.race([
            new Promise(resolve => {
                timeout = setTimeout(resolve, 10000);
            }),
            new Promise(resolve => {
                const loaded = loadPredicates[type];
                if (loaded(context)) {
                    resolve();
                    return;
                }
                interval = setInterval(() => loaded(context) && resolve(), 25);
            })
        ]).then(() => {
            debug.log(`waited for ${type} load: ${Date.now() - startTime}ms`);
            clearTimeout(timeout);
            clearInterval(interval);
        }).then(() => this.emit('load'));
    }

    loadClips() {
        this.clipsChatObserver();
        this.channelObserver();
        this.waitForLoad('clips').then(() => {
            this.emit('load.clips');
            this.emit('load.channel');
        });
    }

    load() {
        this.channelObserver();
        this.conversationObserver();
        this.chatObserver();
        this.vodChatObserver();
        this.routeObserver();

        require('./watchers/*.js', {mode: (base, files) => {
            return files.map(module => {
                return `
                    try {
                        require('${module}');
                    } catch (e) {
                        Raven.captureException(e);
                        debug.error('Failed to load watcher ${module}', e.stack);
                    }
                `;
            }).join(' ');
        }});

        debug.log('Watcher started');
    }

    forceReloadChat() {
        currentChatReference = null;
        this.waitForLoad('chat', {forceReload: true}).then(() => this.emit('load.chat'));
    }

    routeObserver() {
        const onRouteChange = location => {
            const lastPath = currentPath;
            const lastRoute = currentRoute;
            const path = location.pathname;
            const route = getRouteFromPath(path);

            debug.log(`New route: ${location.pathname} as ${route}`);

            // trigger on all loads (like resize functions)
            this.emit('load');

            currentPath = path;
            currentRoute = route;
            if (currentPath === lastPath) return;

            switch (route) {
                case routes.DIRECTORY_FOLLOWING:
                    if (lastRoute === routes.DIRECTORY_FOLLOWING_LIVE) break;
                    this.waitForLoad('following').then(() => this.emit('load.directory.following'));
                    break;
                case routes.CHAT:
                    this.waitForLoad('chat').then(() => this.emit('load.chat'));
                    break;
                case routes.VOD:
                    this.waitForLoad('vod').then(() => this.emit('load.vod'));
                    this.waitForLoad('player').then(() => this.emit('load.player'));
                    break;
                case routes.CHANNEL:
                    this.waitForLoad('channel').then(() => this.emit('load.channel'));
                    this.waitForLoad('chat').then(() => this.emit('load.chat'));
                    this.waitForLoad('player').then(() => this.emit('load.player'));
                    break;
                case routes.HOMEPAGE:
                    this.waitForLoad('homepage').then(() => this.emit('load.homepage'));
                    break;
                case routes.DASHBOARD:
                    this.waitForLoad('chat').then(() => this.emit('load.chat'));
            }
        };

        router.history.listen(location => onRouteChange(location));
        onRouteChange(router.history.location);
    }

    conversationObserver() {
        const emitMessage = element => {
            const msgObject = twitch.getConversationMessageObject(element);
            if (!msgObject) return;
            this.emit('conversation.message', $(element), msgObject);
        };

        const conversationWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);
                    if ($el.hasClass('thread-message__message')) {
                        emitMessage($el[0]);
                    } else {
                        const $thread = $el.find('.whispers-thread');
                        if ($thread.length) {
                            this.emit('conversation.new', $thread);
                        }

                        const $messages = $el.find('.thread-message__message');
                        for (const message of $messages) {
                            emitMessage(message);
                        }
                    }
                }
            })
        );

        const timer = setInterval(() => {
            const element = $('.whispers')[0];
            if (!element) return;
            clearInterval(timer);
            conversationWatcher.observe(element, {childList: true, subtree: true});
        }, 1000);
    }

    chatObserver() {
        const emitMessage = $el => {
            const msgObject = twitch.getChatMessageObject($el[0]);
            if (!msgObject) return;
            this.emit('chat.message', $el, msgObject);
        };

        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});

            // late load messages events
            $(element).find('.chat-line__message').each((index, el) => emitMessage($(el)));
        };

        chatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                const target = mutation.target;
                if (target && target.classList && target.classList.contains('viewer-card')) {
                    const $el = $(target);
                    this.emit('chat.moderator_card.open', $el);
                    return;
                }

                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('chat-line__message')) {
                        emitMessage($el);
                    }

                    if ($el.hasClass('viewer-card')) {
                        this.emit('chat.moderator_card.open', $el);
                    } else if ($el.hasClass('viewer-card-layer__draggable') && $el.find('.viewer-card').length) {
                        const $viewerCard = $el.find('.viewer-card');
                        if ($viewerCard.length) {
                            this.emit('chat.moderator_card.open', $viewerCard);
                        }
                    }

                    if ($el.hasClass('chat-input')) {
                        this.forceReloadChat();
                    }
                }

                for (const el of mutation.removedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('viewer-card-layer__draggable')) {
                        this.emit('chat.moderator_card.close');
                    }
                }
            })
        );

        this.on('load.chat', () => observe(chatWatcher, $(CHAT_ROOM_SELECTOR)[0]));

        // force reload of chat on room swap
        $('body').on(
            'click',
            '.room-picker button[data-test-selector="stream-chat-room-picker-option"], .room-picker button[data-test-selector="room-option-interactable"], .room-selector__header button[data-test-selector="open-room-picker-button"], .room-selector__header button[data-test-selector="close-room-picker-button"]',
            () => this.forceReloadChat()
        );
    }

    vodChatObserver() {
        const emitMessage = chatContent => this.emit('vod.message', $(chatContent));

        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});

            // late load messages events
            $(element).find('.vod-message__content,.vod-message').each((_, el) => emitMessage(el));
        };

        vodChatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    const $chatContents = $el.find('.vod-message__content,.vod-message');

                    for (const chatContent of $chatContents) {
                        emitMessage(chatContent);
                    }
                }
            })
        );

        this.on('load.vod', () => observe(vodChatWatcher, $('.qa-vod-chat')[0]));
    }

    channelObserver() {
        const updateChannel = () => {
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel || (channel && currentChannel.id === channel.id)) return;

            debug.log(`Channel Observer: ${currentChannel.name} (${currentChannel.id}) loaded.`);

            channel = currentChannel;

            api.get(`channels/${channel.name}`)
                .catch(error => ({
                    bots: [],
                    emotes: [],
                    status: error.status || 0
                }))
                .then(data => this.emit('channel.updated', data));
        };

        this.on('load.channel', updateChannel);
        this.on('load.chat', updateChannel);
        this.on('load.vod', updateChannel);
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

                    if ($el.hasClass('tw-mg-b-1') && $el.find('span[data-a-target="chat-message-text"]').length) {
                        this.emit('clips.message', $el);
                    }
                }
            })
        );

        this.on('load.clips', () => observe(clipsChatWatcher, $('body')[0]));
    }
}

module.exports = new Watcher();
