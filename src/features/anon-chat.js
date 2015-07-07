var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if(!vars.userData.isLoggedIn) return;

    var tmi = bttv.chat.tmi();
    if(!tmi) return;

    var session = tmi.tmiSession;
    if(!session) return;

    var room = tmi.tmiRoom;
    if(!room) return;

    try {
        var prodConn = session._connections.prod;
        if(!prodConn) return;

        var prodConnOpts = prodConn._opts;

        if(bttv.settings.get('anonChat') === true) {
            if(prodConnOpts.nickname === vars.userData.login) {
                prodConnOpts.nickname = 'justinfan12345';
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you out of chat..');
                prodConn._send('QUIT');
            }
        } else {
            if(prodConnOpts.nickname !== vars.userData.login) {
                prodConnOpts.nickname = vars.userData.login;
                room._showAdminMessage('BetterTTV: [Anon Chat] Logging you back into chat..');
                prodConn._send('QUIT');
            }
        }
    } catch(e) {
        room._showAdminMessage('BetterTTV: [Anon Chat] We encountered an error anonymizing your chat. You won\'t be hidden in this channel.');
    }
};
