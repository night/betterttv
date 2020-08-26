const api = require('./utils/api');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const SafeEventEmitter = require('./utils/safe-event-emitter');
const $ = require('jquery');
const domObserver = require('./observers/dom');

const CLIPS_HOSTNAME = 'clips.twitch.tv';
const CANCEL_VOD_RECOMMENDATION_SELECTOR = '.recommendations-overlay .pl-rec__cancel.pl-button, .autoplay-vod__content-container button';
const CHAT_ROOM_SELECTOR = 'section[data-test-selector="chat-room-component-layout"]';
const CHAT_SQUAD_WRAPPER = 'div[data-test-selector="chat-wrapper"]';

let router;
let currentPath = '';
let currentRoute = '';
let squadChatWatcher;
let currentChatReference;
let currentChatChannelId;
let currentChannelId;
let channel = {};

const loadPredicates = {
    following: () => !!$('.tw-tabs div[data-test-selector="ACTIVE_TAB_INDICATOR"]').length,
    channel: () => {
        const href = (
            $('.channel-header__user-avatar img').attr('src') ||
            $('h3[data-test-selector="side-nav-channel-info__name_link"] a').attr('href') ||
            $('.channel-info-content img.tw-image-avatar').attr('src')
        );
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
    homepage: () => !!$('.front-page-carousel .video-player__container').length
};

const routes = {
    HOMEPAGE: 'HOMEPAGE',
    DIRECTORY_FOLLOWING_LIVE: 'DIRECTORY_FOLLOWING_LIVE',
    DIRECTORY_FOLLOWING: 'DIRECTORY_FOLLOWING',
    DIRECTORY: 'DIRECTORY',
    CHAT: 'CHAT',
    CHANNEL: 'CHANNEL',
    CHANNEL_SQUAD: 'CHANNEL_SQUAD',
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
    [routes.DASHBOARD]: /^(\/[a-z0-9-_]+\/dashboard|\/u\/[a-z0-9-_]+\/stream-manager)/i,
    [routes.CHANNEL_SQUAD]: /^\/[a-z0-9-_]+\/squad/i,
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
        this.squadChatObserver();

        require('./watchers/*.js', {mode: (base, files) => {
            return files.map(module => {
                return `
                    try {
                        require('${module}');
                    } catch (e) {
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
                case routes.CHANNEL_SQUAD:
                    this.waitForLoad('chat').then(() => this.emit('load.chat.squad')).then(() => this.emit('load.chat'));
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
                    break;
            }
        };

        router.history.listen(location => onRouteChange(location));
        onRouteChange(router.history.location);
    }

    conversationObserver() {
        domObserver.on('.whispers-thread', (node, isConnected) => {
            if (!isConnected) return;

            this.emit('conversation.new', $(node));
        });

        domObserver.on('.thread-message__message', (node, isConnected) => {
            if (!isConnected) return;

            const msgObject = twitch.getConversationMessageObject(node);
            if (!msgObject) return;

            this.emit('conversation.message', $(node), msgObject);
        });
    }

    chatObserver() {
        domObserver.on('.viewer-card', (node, isConnected) => {
            if (!isConnected) {
                this.emit('chat.moderator_card.close');
                return;
            }

            this.emit('chat.moderator_card.open', $(node));
        });

        domObserver.on('.chat-line__message', (node, isConnected) => {
            if (!isConnected) return;

            const msgObject = twitch.getChatMessageObject(node);
            if (!msgObject) return;

            this.emit('chat.message', $(node), msgObject);
        });

        domObserver.on('.chat-input', (node, isConnected) => {
            if (!isConnected) return;

            this.forceReloadChat();
        });
    }

    vodChatObserver() {
        domObserver.on('.vod-message__content,.vod-message', (node, isConnected) => {
            if (!isConnected) return;

            this.emit('vod.message', $(node));
        });
    }

    channelObserver() {
        const updateChannel = () => {
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel || (channel && currentChannel.id === channel.id)) return;

            debug.log(`Channel Observer: ${currentChannel.name} (${currentChannel.id}) loaded.`);

            channel = currentChannel;

            api.get(`cached/users/twitch/${channel.id}`)
                .catch(error => ({
                    bots: [],
                    channelEmotes: [],
                    sharedEmotes: [],
                    status: error.status || 0
                }))
                .then(data => this.emit('channel.updated', data));
        };

        this.on('load.channel', updateChannel);
        this.on('load.chat', updateChannel);
        this.on('load.vod', updateChannel);
    }

    clipsChatObserver() {
        domObserver.on('.tw-mg-b-1 span[data-a-target="chat-message-text"]', (node, isConnected) => {
            if (!isConnected) return;
            this.emit('clips.message', $(node));
        });
    }

    squadChatObserver() {
        let squadChatWrapper;

        const observe = (watcher, element) => {
            if (!element) return;
            squadChatWrapper = element;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {subtree: true, attributes: true});
        };

        squadChatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                if (mutation.type !== 'attributes') return;
                // stream chat changed, so force update current channel and chat
                if (mutation.target.parentElement === squadChatWrapper) {
                    this.forceReloadChat();
                }
            })
        );

        this.on('load.chat.squad', () => observe(squadChatWatcher, $(CHAT_SQUAD_WRAPPER)[0]));
    }
}

module.exports = new Watcher();
