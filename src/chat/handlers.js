var vars = require('../vars'),
    debug = require('../helpers/debug'),
    store = require('./store'),
    tmi = require('./tmi'),
    helpers = require('./helpers'),
    templates = require('./templates'),
    rooms = require('./rooms'),
    embeddedPolling = require('../features/embedded-polling');

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
    } else if (command === '/r') {
            var to = ($.grep(store.__rooms[store.currentRoom].messages, function(msg) {
                return msg.style === 'whisper';
            }))[0].from;
            if (to) {
                sentence[0] = '/w';
                sentence.splice(1, 0, to);
                helpers.sendMessage(sentence.join(' '));
            } else {
                helpers.serverMessage('You have not recieved any whispers', true);
            }
    } else if (command === "/suboff") {
        tmi().tmiRoom.stopSubscribersMode();
    } else if (command === "/localsub") {
        helpers.serverMessage("Local subscribers-only mode enabled.", true);
        vars.localSubsOnly = true;
    } else if (command === "/localsuboff") {
        helpers.serverMessage("Local subscribers-only mode disabled.", true);
        vars.localSubsOnly = false;
    } else if (command === "/localmod") {
        helpers.serverMessage("Local moderators-only mode enabled.", true);
        vars.localModsOnly = true;
    } else if (command === "/localmodoff") {
        helpers.serverMessage("Local moderators-only mode disabled.", true);
        vars.localModsOnly = false;
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
        bttv.TwitchAPI.get('streams/' + bttv.getChannel()).done(function(stream) {
            if (stream.stream !== null) {
                var startedTime = new Date(stream.stream.created_at),
                    totalUptime = Math.round(Math.abs((Date.now() - (startedTime.getTime() - (startedTime.getTimezoneOffset() * 60 * 1000))) / 1000)),
                    days = Math.floor(totalUptime / 86400),
                    hours = Math.floor(totalUptime / 3600) - (days * 24),
                    minutes = Math.floor(totalUptime / 60) - (days * 1440) - (hours * 60),
                    seconds = totalUptime - (days * 86400) - (hours * 3600) - (minutes * 60);
                helpers.serverMessage("Stream uptime: " +
                    (days > 0 ? days + " day"+(days===1?"":"s")+", " : "") +
                    (hours > 0 ? hours + " hour"+(hours===1?"":"s")+", " : "") +
                    (minutes > 0 ? minutes + " minute"+(minutes===1?"":"s")+", " : "") +
                    seconds + " second"+(seconds===1?"":"s"),
                    true
                );
            } else {
                helpers.serverMessage("Stream offline", true);
            }
        }).fail(function () {
            helpers.serverMessage("Could not fetch start time.", true);
        });
    } else if (command === '/help') {
        helpers.serverMessage("BetterTTV Chat Commands:");
        helpers.serverMessage("/b [username] -- Shortcut for /ban");
        helpers.serverMessage("/followers -- Retrieves the number of followers for the channel");
        helpers.serverMessage("/linehistory on/off -- Toggles the chat field history (pressing up/down arrow in textbox)");
        helpers.serverMessage("/localmod -- Turns on local mod-only mode (only your chat is mod-only mode)");
        helpers.serverMessage("/localmodoff -- Turns off local mod-only mode");
        helpers.serverMessage("/localsub -- Turns on local sub-only mode (only your chat is sub-only mode)");
        helpers.serverMessage("/localsuboff -- Turns off local sub-only mode");
        helpers.serverMessage("/massunban (or /unban all or /u all) -- Unbans all users in the channel (channel owner only)");
        helpers.serverMessage("/r [message] -- Reply to your last recieved whisper");
        helpers.serverMessage("/sub -- Shortcut for /subscribers");
        helpers.serverMessage("/suboff -- Shortcut for /subscribersoff");
        helpers.serverMessage("/t [username] [time in seconds] -- Shortcut for /timeout");
        helpers.serverMessage("/u [username] -- Shortcut for /unban");
        helpers.serverMessage("/uptime -- Retrieves the amount of time the channel has been live");
        helpers.serverMessage("/viewers -- Retrieves the number of viewers watching the channel");
        helpers.serverMessage("Native Chat Commands:");
        return false;
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

    // Remove chat image preview if it exists.
    // We really shouldn't have to place this here, but since we don't emit events...
    $("#chat_preview").remove();

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
var notice = exports.notice = function (data) {
    var messageId = data.msgId;
    var message = data.message;

    helpers.serverMessage(message, true);
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
        $.get('https://nightdev.com/betterttv/errors/?obj='+encodeURIComponent(JSON.stringify(error)));
        helpers.serverMessage('BetterTTV encountered an error reading chat. The developer has been sent a log of this action. Please try clearing your cookies and cache.');
    }
};
var privmsg = exports.privmsg = function (channel, data) {
    // Store display names
    if(data.tags && data.tags['display-name']) {
        store.displayNames[data.from] = data.tags['display-name'];
    }

    if(data.style && ['admin','action','notification','whisper'].indexOf(data.style) === -1) return;

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
                badges: data.badges || (data.from === 'twitchnotify' ? [{
                    type: 'subscriber',
                    name: '',
                    description: 'Channel Subscriber'
                }] : []),
                color: '#555'
            }
        );

        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
    }

    if(!store.chatters[data.from]) store.chatters[data.from] = true;

    if(vars.localSubsOnly && !helpers.isModerator(data.from) && !helpers.isSubscriber(data.from)) return;
    if(vars.localModsOnly && !helpers.isModerator(data.from)) return;

    if(store.trackTimeouts[data.from]) delete store.trackTimeouts[data.from];

    var blacklistFilter = require('../features/keywords-lists').blacklistFilter,
        highlighting = require('../features/keywords-lists').highlighting;

    if(bttv.settings.get("blacklistKeywords")) {
        if(blacklistFilter(data)) return;
    }

    var messageHighlighted = bttv.settings.get("highlightKeywords") && highlighting(data);

    // Strawpoll
    embeddedPolling(data);

    data.color = helpers.getColor(data.from);

    data.color = helpers.calculateColor(data.color);

    if (helpers.hasGlow(data.from) && data.style !== 'action') {
        var rgbColor = (data.color === "#ffffff" ? getRgb("#000000") : getRgb(data.color));
        if(bttv.settings.get("darkenedMode") === true) data.color = data.color+"; text-shadow: 0 0 20px rgba("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+",0.8)";
    }

    if (vars.blackChat && data.color === "#000000") {
        data.color = "#ffffff";
    }

    var badges = helpers.getBadges(data.from);
    var bttvBadges = helpers.assignBadges(badges, data);

    data.sender = data.from;

    if(data.bttvDisplayName) {
        helpers.lookupDisplayName(data.from);
        data.from = data.bttvDisplayName;
    } else {
        data.from = helpers.lookupDisplayName(data.from);
    }

    // handle twitch whispers
    if (data.style === 'whisper') {
        var toColor = helpers.getColor(data.to);
        toColor = helpers.calculateColor(toColor);

        var message = templates.whisper({
            message: data.message,
            time: data.date == null ? '' : data.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
            from: data.from,
            sender: data.sender,
            receiver: data.to,
            to: helpers.lookupDisplayName(data.to),
            fromColor: data.color,
            toColor: toColor,
            emotes: data.tags.emotes
        });


        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
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
