var vars = require('../vars'),
    debug = require('../helpers/debug');
var store = require('./store'),
    tmi = require('./tmi'),
    helpers = require('./helpers')
    templates = require('./templates'),
    rooms = require('./rooms');
var embeddedPolling = require('../features/embedded-polling');

// Helper Functions
var getEmoteFromRegEx = require('../helpers/regex').getEmoteFromRegEx;
var rgbToHsl = require('../helpers/colors').rgbToHsl;
var hslToRgb = require('../helpers/colors').hslToRgb;
var getRgb = require('../helpers/colors').getRgb;
var getHex = require('../helpers/colors').getHex;

var commands = exports.commands = function (input) {
    var sentence = input.trim().split(' ');
    var command = sentence[0];

    if (command === "/b") {
        helpers.ban(sentence[1]);
    } else if (command === "/t") {
        var time = 600;
        if(!isNaN(sentence[2])) time = sentence[2];
        helpers.timeout(sentence[1], time);
    } else if (command === "/massunban" || ((command === "/unban" || command === "/u") && sentence[1] === "all")) {
        helpers.massUnban();
    } else if (command === "/u") {
        helpers.unban(sentence[1]);
    } else if (command === "/sub") {
        tmi().tmiRoom.startSubscribersMode();
    } else if (command === "/suboff") {
        tmi().tmiRoom.stopSubscribersMode();
    } else if (command === "/localsub") {
        helpers.serverMessage("Local subscribers-only mode enabled.", true);
        vars.localSubsOnly = true;
    } else if (command === "/localsuboff") {
        helpers.serverMessage("Local subscribers-only mode disabled.", true);
        vars.localSubsOnly = false;
    } else if (command === "/viewers") {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            helpers.serverMessage("Current Viewers: " + Twitch.display.commatize(stream.stream.viewers), true);
        }).fail(function() {
            helpers.serverMessage("Could not fetch viewer count.", true);
        });
    } else if (command === "/followers") {
        bttv.TwitchAPI.get('channels/' + bttv.getChannel() + '/follows').done(function(channel) {
            helpers.serverMessage("Current Followers: " + Twitch.display.commatize(channel._total), true);
        }).fail(function() {
            helpers.serverMessage("Could not fetch follower count.", true);
        });
    } else if (command === "/linehistory") {
        if(sentence[1] === "off") {
            bttv.settings.save('chatLineHistory', false);
        } else {
            bttv.settings.save('chatLineHistory', true);
        }
    } else if (command === "/uptime") {
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function (stream) {
            if (stream.stream !== null) {
                var started = new Date(stream.stream.created_at),
                    now = new Date(),
                    timeDiff = Math.abs(now.getTime() - (started.getTime() - 1000 * 60 * started.getTimezoneOffset())),
                    days = Math.floor(timeDiff / (1000 * 3600 * 24)),
                    hours = Math.floor(timeDiff / (1000 * 3600)) - (days * 24),
                    minutes = Math.floor(timeDiff / (1000 * 60)) - ((days * 24) + (hours * 60)),
                    seconds = Math.floor(timeDiff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
                helpers.serverMessage("Stream uptime: " +
                    (days > 0 ? days + " days " : "") +
                    (hours > 0 ? hours + " hours " : "") +
                    (minutes > 0 ? minutes + " minutes " : "") +
                    (seconds > 0 ? seconds + " seconds " : ""),
                    true
                );
            } else {
                helpers.serverMessage("Stream offline", true);
            }
        }).fail(function () {
            helpers.serverMessage("Could not fetch start time.", true);
        });
    } else {
        return false;
    }
    return true;
};
var countUnreadMessages = exports.countUnreadMessages = function () {
    var rooms = require('./rooms'),
        controller = bttv.getChatController(),
        channels = rooms.getRooms(),
        unreadChannels = 0;

    channels.forEach(function(channel) {
        var channel = rooms.getRoom(channel);
        if(channel.unread > 0) {
            unreadChannels++;
        }
        try {
            channel.emberRoom.set('unreadCount', channel.unread);
        } catch(e) {
            debug.log('Error setting unread count! Ember controller for channel must be removed.');
        }
    });
    controller.set('notificationsCount', unreadChannels);
};
var shiftQueue = exports.shiftQueue = function () {
    var rooms = require('./rooms');

    if(!tmi() || !tmi().get('id')) return;
    var id = tmi().get('id');
    if(id !== store.currentRoom && tmi().get('name')) {
        $('.ember-chat .chat-messages .tse-content .chat-line').remove();
        store.currentRoom = id;
        store.__messageQueue = [];
        rooms.getRoom(id).playQueue();
        helpers.serverMessage('You switched to: '+tmi().get('name').replace(/</g,"&lt;").replace(/>/g,"&gt;"), true);
    } else {
        if(store.__messageQueue.length === 0) return;
        $('.ember-chat .chat-messages .tse-content .chat-lines').append(store.__messageQueue.join(""));
        store.__messageQueue = [];
    }
    helpers.scrollChat();
};
var moderationCard = exports.moderationCard = function (user, $event) {
    var makeCard = require('../features/make-card');
    bttv.TwitchAPI.get('/api/channels/'+user.toLowerCase()+'/ember').done(function(user) {
        if(!user.name) {
            makeCard({ name: user, display_name: user.capitalize() }, $event);
            return;
        }

        makeCard(user, $event);
    }).fail(function() {
        makeCard({ name: user, display_name: user.capitalize() }, $event);
    });
};
var labelsChanged = exports.labelsChanged = function (user) {
    if (bttv.settings.get("adminStaffAlert") === true) {
        var specials = helpers.getSpecials(user);

        if(specials.indexOf('admin') !== -1) {
            helpers.notifyMessage('admin', user+" just joined! Watch out foo!");
        } else if(specials.indexOf('staff') !== -1) {
            helpers.notifyMessage('staff', user+" just joined! Watch out foo!");
        }
    }
};
var clearChat = exports.clearChat = function (user) {
    var trackTimeouts = store.trackTimeouts;

    if(!user) {
        helpers.serverMessage("Chat was cleared by a moderator (Prevented by BetterTTV)", true);
    } else {
        if($('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').length === 0) return;
        if(bttv.settings.get("hideDeletedMessages") === true) {
            $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').each(function () {
                $(this).hide();
                $('div.tipsy').remove();
            });
            setTimeout(function() {
                $('.chat-line .mod-icons .bot, .chat-line .mod-icons .oldbot').each(function () {
                    $(this).parent().parent().find("span.message:contains('"+user.replace(/%/g, '_').replace(/[<>,]/g, '')+"')").each(function () {
                        $(this).parent().hide();
                    });
                });
            }, 3000);
        } else {
            if(bttv.settings.get("showDeletedMessages") !== true) {
                $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function () {
                    $(this).html("<span style=\"color: #999\">&lt;message deleted&gt;</span>").off('click').on('click', function() {
                        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw'))));
                    });
                });
            } else {
                $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"] .message').each(function () {
                    $("a", this).each(function () {
                        var rawLink = "<span style=\"text-decoration: line-through;\">" + $(this).attr("href").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</span>";
                        $(this).replaceWith(rawLink);
                    });
                    $(".emoticon", this).each(function () {
                        $(this).css("opacity","0.1");
                    });
                    $(this).html("<span style=\"color: #999\">" + $(this).html() + "</span>");
                });
            }
            if(trackTimeouts[user]) {
                trackTimeouts[user].count++;
                $('#times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + trackTimeouts[user].timesID).each(function () {
                    $(this).text("(" + trackTimeouts[user].count + " times)");
                });
            } else {
                trackTimeouts[user] = {
                    count: 1,
                    timesID: Math.floor(Math.random()*100001)
                }
                var displayName = helpers.lookupDisplayName(user);
                helpers.serverMessage(displayName + ' has been timed out. <span id="times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + trackTimeouts[user].timesID + '"></span>', true);
            }
        }
    }
};
var onPrivmsg = exports.onPrivmsg = function (channel, data) {
    if(!rooms.getRoom(channel).active() && data.from && data.from !== 'jtv') {
        rooms.getRoom(channel).queueMessage(data);
        return;
    }
    if(!data.message.length) return;
    if(!tmi() || !tmi().tmiRoom) return;
    try {
        privmsg(channel, data);
    } catch(e) {
        if(store.__reportedErrors.indexOf(e.message) !== -1) return;
        store.__reportedErrors.push(e.message);
        console.log(e);
        var error = {
            stack: e.stack,
            message: e.message
        };
        $.get('//nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
        helpers.serverMessage('BetterTTV encountered an error reading chat. The developer has been sent a log of this action. Please try clearing your cookies and cache.');
    }
};
var privmsg = exports.privmsg = function (channel, data) {
    if(data.style && (data.style !== 'admin' && data.style !== 'action' && data.style !== 'notification')) return;

    if(data.style === 'admin' || data.style === 'notification') {
        data.style = 'admin';
        var message = templates.privmsg(
            false,
            data.style === 'action' ? true : false,
            data.style === 'admin' ? true : false,
            vars.userData.isLoggedIn ? helpers.isModerator(vars.userData.login) : false,
            {
                message: data.message,
                time: data.date == null ? '' : data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                nickname: data.from || 'jtv',
                sender: data.from,
                badges: data.badges || (data.from==='twitchnotify'?[{
                    type: 'subscriber',
                    name: '',
                    description: 'Channel Subscriber'
                }]:[]),
                color: '#555'
            }
        );

        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
    }

    if(!store.chatters[data.from]) store.chatters[data.from] = true;

    if(vars.localSubsOnly && !helpers.isModerator(data.from) && !helpers.isSubscriber(data.from)) return;

    if(store.trackTimeouts[data.from]) delete store.trackTimeouts[data.from];


    var blacklistFilter = require('../features/keywords-lists').blacklistFilter,
        highlighting = require('../features/keywords-lists').highlighting;

    if(bttv.settings.get("blacklistKeywords")) {
        if(blacklistFilter(data)) return;
    }

    var messageHighlighted = bttv.settings.get("highlightKeywords") && highlighting(data);

    if(bttv.settings.get('embeddedPolling')) {
        if(helpers.isOwner(data.from)) {
            var strawpoll = /strawpoll\.me\/([0-9]+)/g.exec(data.message);
            if(strawpoll) {
                embeddedPolling(strawpoll[1]);
            }
        }
    }

    //Bots
    var bots = require('../bots');
    if(bots.indexOf(data.from) !== -1 && helpers.isModerator(data.from)) { data.bttvTagType="bot"; data.bttvTagName = "Bot"; }

    if (bttv.settings.get("showJTVTags") === true) {
        if (data.bttvTagType == "moderator" || data.bttvTagType == "broadcaster" || data.bttvTagType == "admin" || data.bttvTagType == "global_mod" || data.bttvTagType == "staff" || data.bttvTagType === "bot") data.bttvTagType = 'old'+data.bttvTagType;
    }

    data.color = helpers.getColor(data.from);

    if(data.color === "black") data.color = "#000000";
    if(data.color === "MidnightBlue") data.color = "#191971";
    if(data.color === "DarkRed") data.color = "#8B0000";

    data.color = helpers.calculateColor(data.color);

    if (bttv.glow && bttv.glow[data.from] && data.style !== 'action') {
        var rgbColor = (data.color === "#ffffff" ? getRgb("#000000") : getRgb(data.color));
        if(bttv.settings.get("darkenedMode") === true) data.color = data.color+"; text-shadow: 0 0 20px rgba("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+",0.8)";
    }

    if (vars.blackChat && data.color === "#000000") {
        data.color = "#ffffff";
    }

    var specialUsers = {
        "night": { dev: true, tagType: "bttvDeveloper" },
        "dtittel": { dev: true, tagType: "bttvDeveloper" },
        "vendethiel": { dev: true, tagType: "bttvDeveloper" },
        "teak42": { dev: true, tagType: "bttvDeveloper" },
        "matthewjk": { supporter: true, team: "Support", tagType: "bttvSupporter" },
        "julia_cs": { supporter: true, team: "Design", tagType: "bttvSupporter" },
        "vaughnwhiskey": { supporter: true, team: "Support", tagType: "bttvSupporter" },
        "izl": { supporter: true, team: "Support", tagType: "bttvSupporter" },
        "jacksack": { supporter: true, team: "Design", tagType: "bttvSupporter" }
    }

    var legacyTags = require('../legacy-tags')(data);

    if(legacyTags[data.from] && ((legacyTags[data.from].mod === true && helpers.isModerator(data.from)) || legacyTags[data.from].mod === false)) {
        var userData = legacyTags[data.from];
        if(userData.tagType) data.bttvTagType = (["moderator","broadcaster","admin","global_mod","staff","bot"].indexOf(userData.tagType) !== -1) ? 'old'+userData.tagType : userData.tagType;
        if(userData.tagName) data.bttvTagName = userData.tagName;
        if(userData.color && data.style !== 'action') data.color = userData.color;
        if(userData.nickname) data.bttvDisplayName = userData.nickname;
        data.bttvTagDesc = "Grandfathered BetterTTV Swag Tag";
    }

    var badges = helpers.getBadges(data.from);
    var bttvBadges = helpers.assignBadges(badges, data);

    if(specialUsers[data.from]) {
        var userData = specialUsers[data.from];
        bttvBadges.push({
            type: userData.tagType,
            name: "&#8203;",
            description: userData.dev ? 'NightDev Developer':'NightDev '+userData.team+' Team'
        });
    }

    data.sender = data.from;

    if(data.bttvDisplayName) {
        helpers.lookupDisplayName(data.from);
        data.from = data.bttvDisplayName;
    } else {
        data.from = helpers.lookupDisplayName(data.from);
    }

    var message = templates.privmsg(
        messageHighlighted,
        data.style === 'action' ? true : false,
        data.style === 'admin' ? true : false,
        vars.userData.isLoggedIn ? (helpers.isModerator(vars.userData.login) && (!helpers.isModerator(data.sender) || (vars.userData.login === channel && vars.userData.login !== data.sender))) : false,
        {
            message: data.message,
            time: data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
            nickname: data.from,
            sender: data.sender,
            badges: bttvBadges,
            color: data.color,
            emotes: data.tags.emotes
        }
    );

    store.__messageQueue.push(message);
}
