var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if(bttv.settings.get("hostButton") !== true || !vars.userData.isLoggedIn) return;
    
    var chat = bttv.chat;
    var tmi = chat.tmi();

    if(!tmi) return;

    var helpers = chat.helpers;
    var userId = tmi.tmiSession ? tmi.tmiSession.userId : 0;
    var ownerId = tmi.tmiRoom ? tmi.tmiRoom.ownerId : 0;

    if(!tmi.tmiSession || !tmi.tmiSession._tmiApi) return;

    var $hostButton = $('#bttv-host-button');

    if(!$hostButton.length) {
        $hostButton = $("<span><span></span></span>");
        $hostButton.addClass('button').addClass('action');
        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.insertBefore('#channel .channel-actions .theatre-button');
        $hostButton.click(function() {
            var action = $hostButton.text();

            if(action === 'Unhost') {
                try {
                    tmi.tmiSession._connections.prod._send('PRIVMSG #' + vars.userData.login + ' :/unhost');
                    helpers.serverMessage('BetterTTV: We sent a /unhost to your channel.');
                    $hostButton.children('span').text('Host');
                } catch(e) {
                    helpers.serverMessage('BetterTTV: There was an error unhosting the channel. You may need to unhost it from your channel.');
                }
            } else {
                try {
                    tmi.tmiSession._connections.prod._send('PRIVMSG #' + vars.userData.login + ' :/host ' + bttv.getChannel());
                    helpers.serverMessage('BetterTTV: We sent a /host to your channel. Please note you can only host 3 times per 30 minutes.');
                    $hostButton.children('span').text('Unhost');
                } catch(e) {
                    helpers.serverMessage('BetterTTV: There was an error hosting the channel. You may need to host it from your channel.');
                }
            }
        });
    }

    tmi.tmiSession._tmiApi.get('/hosts', {
        host: userId
    }).then(function(data) {
        if(!data.hosts || !data.hosts.length) return;

        if(data.hosts[0].target_id === ownerId) {
            $hostButton.children('span').text('Unhost');
        } else {
            $hostButton.children('span').text('Host');
        }
    });
}