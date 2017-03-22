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

        this.enabled = false;
        watcher.on('load.chat', () => this.load());
        watcher.on('chat.message', ($el, emberView) => this.onMessage($el, emberView));
        settings.on('changed.anonChat', () => this.load());
    }

    changeUser(username, message) {
        const tmiSession = twitch.getCurrentTMISession();
        if (!tmiSession) return;

        const prodConn = tmiSession._connections.main;
        if (prodConn._opts.nickname === username) return;

        ignoreNextDC = true;
        prodConn._opts.nickname = username;
        twitch.sendChatAdminMessage(`BetterTTV: [Anon Chat] ${message}`);
        prodConn._send('QUIT');
    }

    part() {
        this.changeUser('justinfan12345', 'Logging you out of chat...');
        this.enabled = true;
    }

    join() {
        const currentUser = twitch.getCurrentUser();
        if (!currentUser) return;

        this.changeUser(currentUser.name, 'Logging you into chat...');
        this.enabled = false;
    }

    load() {
        if (forcedURL || settings.get('anonChat')) {
            this.part();
        } else {
            this.join();
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
