var debug = require('../debug'),
    vars = require('../vars');

module.exports = function dashboardChannelInfo() {
    if ($("#dash_main").length) {
        debug.log("Updating Dashboard Channel Info");

        Twitch.api.get("streams/" + bttv.getChannel()).done(function (a) {
            if (a.stream) {
                $("#channel_viewer_count span").text(Twitch.display.commatize(a.stream.viewers));
                if(a.stream.channel.views) $("#views_count").text(Twitch.display.commatize(a.stream.channel.views));
            } else {
                $("#channel_viewer_count span").text("Offline");
            }
        });
        Twitch.api.get("channels/" + bttv.getChannel() + "/follows?limit=1").done(function (a) {
            if (a["_total"]) {
                $("#followers_count span").text(Twitch.display.commatize(a["_total"]));
            }
        });
        if(!$("#chatters_count").length) {
            var $chattersContainer = $("<div/>");
            var $chatters = $("<span/>");

            $chattersContainer.attr("class", "stat");
            $chattersContainer.attr("id", "chatters_count");

            $chatters.text("0");
            $chatters.attr("tooltipdata", "Chatters");

            $chattersContainer.append($chatters);
            $("#followers_count").after($chattersContainer);
        }

        $.getJSON('http://tmi.twitch.tv/group/user/' + bttv.getChannel() + '/chatters?callback=?', function(data) {
            if(data.data && data.data.chatter_count) $("#chatters_count span").text(Twitch.display.commatize(data.data.chatter_count));
        });

        if(vars.dontCheckSubs !== true) {
            $.get('/broadcast/dashboard/partnership', function (data) {
                var $subsContainer = $(data).find("div.wrapper"),
                    subsRegex = /Your channel currently has ([0-9,]+) paying subscribers and ([0-9,]+) total active subscribers/;

                if ($subsContainer) {
                    var containerText = $subsContainer.text();

                    if(containerText.match(subsRegex)) {
                        var subAmounts = subsRegex.exec(containerText),
                            activeSubs = subAmounts[2];

                        if(!$("#subs_count").length) {
                            var $subsContainer = $("<div/>");
                            var $subs = $("<span/>");

                            $subsContainer.attr("class", "stat");
                            $subsContainer.attr("id", "subs_count");

                            $subs.text("0");
                            $subs.attr("tooltipdata", "Active Subscribers");

                            $subsContainer.append($subs);
                            $("#chatters_count").after($subsContainer);

                            Twitch.api.get("chat/" + bttv.getChannel() + "/badges").done(function(a) {
                                if(a.subscriber) {
                                    $("#subs_count").css("background-image", "url("+a.subscriber.image+")");
                                }
                            });
                        }

                        $("#subs_count span").text(Twitch.display.commatize(activeSubs));
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