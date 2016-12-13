var vars = require('../vars');

module.exports = function() {
    if (bttv.settings.get('hostButton') !== true || !vars.userData.isLoggedIn) return;

    var chat = bttv.chat;
    var tmi = chat.tmi();

    if (!tmi) return;

    var helpers = chat.helpers;
    var userId = tmi.tmiSession ? tmi.tmiSession.userId : 0;
    var ownerId = tmi.tmiRoom ? tmi.tmiRoom.ownerId : 0;

    if (!tmi.tmiSession || !tmi.tmiSession._tmiApi) return;

    var $hostButton = $('#bttv-host-button');

    if (!$hostButton.length) {
        // different layouts...
        if ($('#channel .cn-metabar__more .js-share-box').length) {
            $hostButton = $('<button><span></span></button>');
            $hostButton.addClass('button').addClass('action button--hollow mg-l-1');
            $hostButton.insertAfter('#channel .cn-metabar__more .js-share-box');
        } else if ($('#channel .cn-bar .cn-tabs--2').length) {
            $hostButton = $('<dd class="cn-tabs__button"><button class="button"><span></span></button></dd>');
            $hostButton.insertBefore('#channel .cn-bar .cn-tabs--2 .cn-tabs__button:first');
        } else {
            // Old layout
            $hostButton = $('<span><span></span></span>');
            $hostButton.addClass('button').addClass('action');
            $hostButton.insertBefore('#channel .channel-actions > span:eq(2)');
        }

        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.click(function() {
            var action = $hostButton.text();

            var conn = tmi.tmiSession._connections.aws || tmi.tmiSession._connections.prod || tmi.tmiSession._connections.main;

            if (action === 'Unhost') {
                try {
                    conn._send('PRIVMSG #' + vars.userData.name + ' :/unhost');
                    helpers.serverMessage('BetterTTV: We sent a /unhost to your channel.');
                    $hostButton.find('span').text('Host');
                } catch (e) {
                    helpers.serverMessage('BetterTTV: There was an error unhosting the channel. You may need to unhost it from your channel.');
                }
            } else {
                try {
                    conn._send('PRIVMSG #' + vars.userData.name + ' :/host ' + bttv.getChannel());
                    helpers.serverMessage('BetterTTV: We sent a /host to your channel. Please note you can only host 3 times per 30 minutes.');
                    $hostButton.find('span').text('Unhost');
                } catch (e) {
                    helpers.serverMessage('BetterTTV: There was an error hosting the channel. You may need to host it from your channel.');
                }
            }
        });
    }

    tmi.tmiSession._tmiApi.get('/hosts', {
        host: userId
    }).then(function(data) {
        if (!data.hosts || !data.hosts.length) return;

        if (data.hosts[0].target_id === ownerId) {
            $hostButton.find('span').text('Unhost');
        } else {
            $hostButton.find('span').text('Host');
        }
    });
};
