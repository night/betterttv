const api = require('./utils/api');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const SafeEventEmitter = require('./utils/safe-event-emitter');
const $ = require('jquery');

let router;
let route = '';
let chatWatcher;
let channel = {};

const loadPredicates = {
    following: () => !!$('.following__header-tabs').length,
    channel: () => {
        const href = $('.channel-header__user').attr('href');
        return !!href && href !== '/undefined';
    },
    chat: () => !!twitch.getCurrentChat() && !!twitch.getCurrentChannel(),
    player: () => !!twitch.getCurrentPlayer()
};

class Watcher extends SafeEventEmitter {
    constructor() {
        super();

        const loadInterval = setInterval(() => {
            let user;
            try {
                const connectRoot = twitch.getConnectRoot();
                if (!connectRoot) return;
                const context = connectRoot._context;
                router = context.router;
                user = context.store.getState().session.user;
            } catch (_) {
                return;
            }

            if (!router) return;
            clearInterval(loadInterval);

            twitch.setCurrentUser(user.authToken, user.id, user.login, user.displayName);
            this.load();
        }, 25);
    }

    waitForLoad(type) {
        let timeout;
        let interval;
        const startTime = Date.now();
        return Promise.race([
            new Promise(resolve => {
                timeout = setTimeout(resolve, 10000);
            }),
            new Promise(resolve => {
                const loaded = loadPredicates[type];
                if (loaded()) {
                    resolve();
                    return;
                }
                interval = setInterval(() => loaded() && resolve(), 25);
            })
        ]).then(() => {
            debug.log(`waited for ${type} load: ${Date.now() - startTime}ms`);
            clearTimeout(timeout);
            clearInterval(interval);
        }).then(() => this.emit('load'));
    }

    load() {
        this.channelObserver();
        this.chatObserver();
        this.routeObserver();
        this.darkObserver();

        debug.log('Watcher started');
    }

    routeObserver() {
        const onRouteChange = location => {
            debug.log(`New route: ${location.pathname}`);

            // trigger on all loads (like resize functions)
            this.emit('load');

            const lastRoute = route;
            const path = location.pathname.split('/');
            route = path[1];

            switch (route) {
                case 'directory':
                    if (lastRoute === 'directory') break;
                    if (path[2] === 'following') {
                        this.waitForLoad('following')
                            .then(() => this.emit('load.directory.following'));
                    }
                    break;
                default:
                    route = 'channel';
                    if (lastRoute === 'channel') break;
                    this.waitForLoad('channel').then(() => this.emit('load.channel'));
                    this.waitForLoad('chat').then(() => this.emit('load.chat'));
                    this.waitForLoad('player').then(() => this.emit('load.player'));
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

        const observe = (watcher, element) => {
            if (!element) return;
            if (watcher) watcher.disconnect();
            watcher.observe(element, {childList: true, subtree: true});

            // late load messages events
            $(element).find('.chat-line__message').each((index, el) => emitMessage($(el)));
        };

        chatWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.hasClass('chat-line__message')) {
                        emitMessage($el);
                    }
                }
            })
        );

        this.on('load.chat', () => observe(chatWatcher, $('.chat__container')[0]));
    }

    darkObserver() {
        const store = twitch.getConnectRoot()._context.store;
        let currentState = store.getState().ui.theme;
        store.subscribe(() => {
            const newState = twitch.getConnectRoot()._context.store.getState().ui.theme;
            if (currentState !== newState) {
                currentState = newState;
                this.emit('dark.change', newState ? true : false);
            }
        });
    }

    channelObserver() {
        this.on('load.channel', () => {
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel) return;

            if (currentChannel.id === channel.id) return;
            channel = currentChannel;
            api
                .get(`channels/${channel.name}`)
                .then(d => this.emit('channel.updated', d));
        });
    }
}

module.exports = new Watcher();
