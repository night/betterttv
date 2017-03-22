const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const Raven = require('raven-js');

const forcedURL = window.location.search && window.location.search.indexOf('bttv_anon_chat=true') > -1;

class AnonChatModule {
    constructor() {
        settings.add({
            id: 'anonChat',
            name: 'Anon Chat',
            defaultValue: false,
            description: 'Join channels without appearing in chat'
        });

        this.ignoreNextDC = false;
        watcher.on('load.chat', () => this.load());
        watcher.on('chat.message', ($el, emberView) => this.onMessage($el, emberView));
        settings.on('changed.anonChat', () => this.load());
    }

    load(force) {
        if (force === undefined) {
            this.enabled = forcedURL || settings.get('anonChat');
        } else {
            this.enabled = force;
        }

        const currentUser = twitch.getCurrentUser();
        if (!currentUser) return;

        const session = twitch.getCurrentTMISession();
        if (!session) return;

        try {
            const prodConn = session._connections.aws || session._connections.prod || session._connections.main;
            if (!prodConn) return;

            const prodConnOpts = prodConn._opts;

            if (this.enabled && prodConnOpts.nickname === currentUser.name) {
                prodConnOpts.nickname = 'justinfan12345';
                twitch.sendChatAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat...');
                this.ignoreNextDC = true;
                prodConn._send('QUIT');
            } else if (!this.enabled && prodConnOpts.nickname !== currentUser.name) {
                prodConnOpts.nickname = currentUser.name;
                twitch.sendChatAdminMessage('BetterTTV: [Anon Chat] Logging you into chat...');
                this.ignoreNextDC = true;
                prodConn._send('QUIT');
            }
        } catch (e) {
            twitch.sendChatAdminMessage('BetterTTV: [Anon Chat] We encountered an error anonymizing your chat. You won\'t be hidden in this channel.');
            Raven.captureException(e);
        }
    }

    onMessage($el, data) {
        if (this.ignoreNextDC && data.message.indexOf('unable to connect to chat') > -1) {
            this.ignoreNextDC = false;
            $el.hide();
        }
    }
}

module.exports = new AnonChatModule();
