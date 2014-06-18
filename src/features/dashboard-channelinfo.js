var debug = require('debug'),
    vars = require('vars');

module.exports = function dashboardChannelInfo() {
    if ($("#dash_main").length) {
        debug.log("Updating Dashboard Channel Info");

        Twitch.api.get("streams/" + bttv.getChannel()).done(function (a) {
            if (a.stream) {
                $("#channel_viewer_count").text(Twitch.display.commatize(a.stream.viewers));
                if(a.stream.channel.views) $("#views_count").html(Twitch.display.commatize(a.stream.channel.views));
            } else {
                $("#channel_viewer_count").text("Offline");
            }
        });
        Twitch.api.get("channels/" + bttv.getChannel() + "/follows?limit=1").done(function (a) {
            if (a["_total"]) {
                $("#followers_count").text(Twitch.display.commatize(a["_total"]));
            }
        });
        if(!$("#chatters_count").length) {
            var $chattersContainer = $("<div></div>");
            $chattersContainer.attr("class", "stat");
            $chattersContainer.attr("id", "chatters_count");
            $chattersContainer.attr("tooltipdata", "Chatters");
            $chattersContainer.text('0');
            $("#followers_count").after($chattersContainer);
        }

        $.getJSON('http://tmi.twitch.tv/group/user/' + bttv.getChannel() + '/chatters?callback=?', function(data) {
            if(data.data && data.data.chatter_count) $("#chatters_count").text(Twitch.display.commatize(data.data.chatter_count));
        });

        if(vars.dontCheckSubs !== true) {
            $.get('/broadcast/dashboard/partnership', function (data) {
                var $subsContainer = $(data).find("div.main div.wrapper"),
                    subsRegex = /Your channel currently has ([0-9,]+) paying subscribers and ([0-9,]+) total active subscribers/;
                    Your channel currently has 42 paying subscribers and 45 total active subscribers
                if ($subsContainer) {
                    var containerText = $subsContainer.text();

                    if(containerText.match(subsRegex)) {
                        var subAmounts = subsRegex.exec(containerText),
                            activeSubs = subAmounts[2];

                        if(!$("#channel_subs_count").length) {
                            var $subsContainer = $("<div></div>");
                            $subsContainer.attr("class", "stat");
                            $subsContainer.attr("id", "channel_subs_count");
                            $subsContainer.attr("tooltipdata", "Active Subscribers");
                            $subsContainer.text(Twitch.display.commatize(activeSubs));
                            $("#chatters_count").after($subsContainer);

                            Twitch.api.get("chat/" + bttv.getChannel() + "/badges").done(function (a) {
                                if (a.subscriber) {
                                    $("#channel_subs_count").css("background", "url("+a.subscriber.image+") no-repeat left center");
                                    $("#channel_subs_count").css("background-size", "14px 14px");
                                }
                            });
                        } else {
                            $("#channel_subs_count").text(Twitch.display.commatize(activeSubs));
                        }
                    } else {
                        vars.dontCheckSubs = true;
                        debug.log("Dashboard Info -> Channel doesn't have subscribers.");
                    }
                } else {
                    debug.warn("Dashboard Info -> Error loading partnership page.");
                }
            });
        }

        setTimeout(dashboardChannelInfo, 60000);
    }
};