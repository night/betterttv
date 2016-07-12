var vars = require('../vars');

var forcedURL = window.location.search && window.location.search.indexOf('bttv_anon_chat=true') > -1;

module.exports = function(force) {
    if (!vars.userData.isLoggedIn) return;

    var enabled = false;
    if (forcedURL) {
        enabled = true;
    } else if (typeof force === 'boolean') {
        enabled = force;
    } else {
        enabled = bttv.settings.get('anonChat');
    }

    var tmi = bttv.chat.tmi();
    if (!tmi) return;

    var session = tmi.tmiSession;
    if (!session) return;

    var room = tmi.tmiRoom;
    if (!room) return;

    try {
        var prodConn = session._connections.aws || session._connections.prod || session._connections.main;
        if (!prodConn) return;

        var prodConnOpts = prodConn._opts;

        if (enabled) {
            if (prodConnOpts.nickname === vars.userData.name) {
                prodConnOpts.nickname = 'justinfan12345';
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat...');
                bttv.chat.store.isAnonMode = true;
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        } else {
            if (prodConnOpts.nickname !== vars.userData.name) {
                prodConnOpts.nickname = vars.userData.name;
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you into chat...');
                bttv.chat.store.isAnonMode = false;
                bttv.chat.store.ignoreDC = true;
                prodConn._send('QUIT');
            }
        }
    } catch (e) {
        room._showAdminMessage('BetterTTV: [Anon Chat] We encountered an error anonymizing your chat. You won\'t be hidden in this channel.');
    }
};
