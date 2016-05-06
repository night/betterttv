var debug = require('../helpers/debug'),
    vars = require('../vars');

var checkFollowing = module.exports = function() {
    debug.log('Check Following List');

    if ($('body#chat').length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

    var fetchFollowing = function(callback, followingList, followingNames, offset) {
        followingList = followingList || [];
        followingNames = followingNames || [];
        offset = offset || 0;

        bttv.TwitchAPI.get('streams/followed?stream_type=live&limit=100&offset=' + offset, {}, { auth: true }).done(function(d) {
            if (!d.streams || !d.streams.length) return callback(followingList);

            d.streams.forEach(function(stream) {
                if (followingNames.indexOf(stream.channel.name) === -1) {
                    followingNames.push(stream.channel.name);
                    followingList.push(stream);
                }
            });

            if (d.streams.length === 100) {
                fetchFollowing(function(fetchedFollowingList) {
                    callback(fetchedFollowingList);
                }, followingList, followingNames, offset + 100);
                return;
            }

            callback(followingList);
        }).fail(function() {
            callback(followingList);
        });
    };

    fetchFollowing(function(streams) {
        if (!streams) {
            streams = [];
        }

        if (vars.liveChannels.length === 0) {
            vars.liveChannels.push('loaded');
            streams.forEach(function(stream) {
                var channel = stream.channel;
                if (vars.liveChannels.indexOf(channel.name) === -1) {
                    vars.liveChannels.push(channel.name);
                }
            });
        } else if (streams.length > 0) {
            var channels = [];
            streams.forEach(function(stream) {
                var channel = stream.channel;
                channels.push(channel.name);
                if (vars.userData.isLoggedIn && vars.liveChannels.indexOf(channel.name) === -1 && bttv.settings.get('followingNotifications') === true) {
                    bttv.TwitchAPI.get('users/' + encodeURIComponent(vars.userData.name) + '/follows/channels/' + encodeURIComponent(channel.name)).done(function(follow) {
                        if (follow.notifications === false) return;

                        debug.log(channel.name + ' is now streaming');
                        if (channel.game === null) channel.game = 'on Twitch';
                        bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', {
                            title: channel.display_name + ' is Now Streaming',
                            url: channel.url,
                            image: channel.logo,
                            tag: 'channel_live_' + channel.name,
                            expires: 600000
                        });
                    });
                }
            });
            vars.liveChannels = channels;
        }

        if (!$('#bttv-small-nav-count').length) {
            var $count = $('<div/>');
            $count.addClass('js-total');
            $count.attr('id', 'bttv-small-nav-count');
            $count.insertBefore('.warp a.warp__tipsy[data-tt_content="directory_following"] figure');
        }

        $('#bttv-small-nav-count').text(streams.length);
        $('#bttv-small-nav-count').css('display', 'inline');

        setTimeout(checkFollowing, 60000 + Math.random() * 5000);
    });
};
