const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let ignoreNextDC = false;
const forcedURL = window.location.search.includes('bttv_anon_chat=true');

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

    part() {
        const currentUser = twitch.getCurrentUser();
        const tmiSession = twitch.getCurrentTMISession();
        if (!currentUser || !tmiSession) return;

        const prodConn = tmiSession._connections.main;
        if (prodConn._opts.nickname !== currentUser.name) return;

        prodConnOpts.nickname = 'justinfan12345';
        twitch.sendChatAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat...');
        ignoreNextDC = true;
        prodConn._send('QUIT');
    }

    join() {
        const currentUser = twitch.getCurrentUser();
        const tmiSession = twitch.getCurrentTMISession();
        if (!currentUser || !tmiSession) return;

        const prodConn = tmiSession._connections.main;
        if (prodConn._opts.nickname === currentUser.name) return;

        prodConnOpts.nickname = currentUser.name;
        twitch.sendChatAdminMessage('BetterTTV: [Anon Chat] Logging you into chat...');
        ignoreNextDC = true;
        prodConn._send('QUIT');
    }

    load() {
        if (forcedURL || settings.get('anonChat')) {
            this.join();
        } else {
            this.part();
        }
    }

    onMessage($el, data) {
        if (ignoreNextDC && data.message.includes('unable to connect to chat')) {
            ignoreNextDC = false;
            $el.hide();
        }
    }
}

module.exports = new AnonChatModule();
