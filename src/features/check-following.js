var debug = require('debug'),
    vars = require('vars');

var checkFollowing = module.exports = function () {
    debug.log("Check Following List");

    if($("body#chat").length || $('body[data-page="ember#chat"]').length || !vars.userData.isLoggedIn) return;

    var fetchFollowing = function(callback, followingList, followingNames, offset) {
        var followingList = followingList || [],
            followingNames = followingNames || [],
            offset = offset || 0;

        Twitch.api.get("streams/followed?limit=100&offset="+offset).done(function (d) {
            if (d.streams && d.streams.length > 0) {
                d.streams.forEach(function(stream) {
                    // Temporary fix for bad streams being included in the list
                    if(!stream.viewers) {
                        var error = {
                            date: new Date(),
                            type: 'viewers null',
                            stream: stream
                        }
                        $.get('//nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
                        return;
                    }

                    if(followingNames.indexOf(stream.channel.name) === -1) {
                        followingNames.push(stream.channel.name);
                        followingList.push(stream);
                    }
                });
                if(d.streams.length === 100) {
                    fetchFollowing(function(followingList) {
                        callback(followingList);
                    }, followingList, followingNames, offset+100);
                } else {
                    callback(followingList);
                }
            } else {
                callback(followingList);
            }
        });
    }

    fetchFollowing(function(streams) {
        if (vars.liveChannels.length === 0) {
            vars.liveChannels.push("loaded");
            streams.forEach(function(stream) {
                var channel = stream.channel;
                if (vars.liveChannels.indexOf(channel.name) === -1) {
                    vars.liveChannels.push(channel.name);
                }
            });
        } else if(streams.length > 0) {
            var channels = [];
            streams.forEach(function(stream) {
                var channel = stream.channel;
                channels.push(channel.name);
                if (vars.liveChannels.indexOf(channel.name) === -1) {
                    debug.log(channel.name+" is now streaming");
                    if (channel.game == null) channel.game = "on Twitch";
                    bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', channel.display_name + ' is Now Streaming', channel.url, channel.logo, 'channel_live_'+channel.name);
                }
            });
            vars.liveChannels = channels;
        }

        if(!$("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").length) {
            $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"]").append('<span class="total_count js-total" style="display: none;"></span>');
        }
        $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").text(streams.length);
        $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").css("display","inline");

        setTimeout(checkFollowing, 60000);
    });
}