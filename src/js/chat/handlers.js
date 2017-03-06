var vars = require('../vars'),
    debug = require('../helpers/debug'),
    store = require('./store'),
    tmi = require('./tmi'),
    helpers = require('./helpers'),
    templates = require('./templates'),
    rooms = require('./rooms'),
    throttle = require('lodash.throttle'),
    pinnedHighlights = require('../features/pinned-highlights'),
    embeddedPolling = require('../features/embedded-polling'),
    channelState = require('../features/channel-state'),
    audibleFeedback = require('../features/audible-feedback'),
    timestamp = require('../helpers/timestamp').timestamp;

// Helper Functions
var getRgb = require('../helpers/colors').getRgb;

var secondsToLength = function(s) {
    var days = Math.floor(s / 86400);
    var hours = Math.floor(s / 3600) - (days * 24);
    var minutes = Math.floor(s / 60) - (days * 1440) - (hours * 60);
    var seconds = s - (days * 86400) - (hours * 3600) - (minutes * 60);

    return (days > 0 ? days + ' day' + (days === 1 ? '' : 's') + ', ' : '') +
           (hours > 0 ? hours + ' hour' + (hours === 1 ? '' : 's') + ', ' : '') +
           (minutes > 0 ? minutes + ' minute' + (minutes === 1 ? '' : 's') + ', ' : '') +
           seconds + ' second' + (seconds === 1 ? '' : 's');
};

exports.commands = function(input) {
    var sentence = input.trim().split(' ');
    var command = sentence[0].toLowerCase();
    var channelName = bttv.getChannel();
    var oldSetting;

    if (command === '/b') {
        helpers.ban(sentence[1], sentence.slice(2).join(' '));
    } else if (command === '/chatters') {
        $.getJSON('https://tmi.twitch.tv/group/user/' + channelName + '?callback=?').done(function(resp) {
            helpers.serverMessage('Current Chatters: ' + Twitch.display.commatize(resp.data.chatter_count), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch chatter count.', true);
        });
    } else if (command === '/followed') {
        if (vars.userData.isLoggedIn) {
            var chan = sentence.length > 1 ? sentence[1] : channelName;
            helpers.followDate(vars.userData.name, chan);
        } else {
            helpers.serverMessage('You need to be logged in to use this command', true);
        }
    } else if (command === '/followcount') {
        bttv.TwitchAPI.get('channels/' + channelName + '/follows').done(function(channel) {
            helpers.serverMessage('Current Followers: ' + Twitch.display.commatize(channel._total), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch follower count.', true);
        });
    } else if (command === '/join') {
        oldSetting = bttv.settings.get('anonChat');
        bttv.settings.save('anonChat', false);
        bttv.settings.set('anonChat', oldSetting);
    } else if (command === '/linehistory') {
        bttv.settings.save('chatLineHistory', sentence[1] === 'off' ? false : true);
    } else if (command === '/localascii') {
        helpers.serverMessage('Local ascii-only mode enabled.', true);
        vars.localAsciiOnly = true;
    } else if (command === '/localasciioff') {
        helpers.serverMessage('Local ascii-only mode disabled.', true);
        vars.localAsciiOnly = false;
    } else if (command === '/localmod') {
        helpers.serverMessage('Local moderators-only mode enabled.', true);
        vars.localModsOnly = true;
    } else if (command === '/localmodoff') {
        helpers.serverMessage('Local moderators-only mode disabled.', true);
        vars.localModsOnly = false;
    } else if (command === '/localsub') {
        helpers.serverMessage('Local subscribers-only mode enabled.', true);
        vars.localSubsOnly = true;
    } else if (command === '/localsuboff') {
        helpers.serverMessage('Local subscribers-only mode disabled.', true);
        vars.localSubsOnly = false;
    } else if (command === '/massunban' || ((command === '/unban' || command === '/u') && sentence[1] === 'all')) {
        helpers.massUnban();
    } else if (command === '/p' || command === '/purge') {
        helpers.timeout(sentence[1], 1);
    } else if (command === '/part') {
        oldSetting = bttv.settings.get('anonChat');
        bttv.settings.save('anonChat', true);
        bttv.settings.set('anonChat', oldSetting);
    } else if (command === '/shrug') {
        sentence.shift();
        helpers.sendMessage(sentence.join(' ') + ' ¯\\_(ツ)_/¯');
    } else if (command === '/squishy') {
        helpers.sendMessage('notsquishY WHEN YOU NEED HIM notsquishY IN A JIFFY notsquishY USE THIS EMOTE notsquishY TO SUMMON SQUISHY notsquishY');
    } else if (command === '/sub') {
        tmi().tmiRoom.startSubscribersMode();
    } else if (command === '/suboff') {
        tmi().tmiRoom.stopSubscribersMode();
    } else if (command === '/t') {
        var time = 600;
        if (!isNaN(sentence[2])) time = sentence[2];
        helpers.timeout(sentence[1], time, sentence.slice(3).join(' '));
    } else if (command === '/u') {
        helpers.unban(sentence[1]);
    } else if (command === '/uptime') {
        bttv.TwitchAPI.get('streams/' + channelName).done(function(stream) {
            if (stream.stream !== null) {
                var startedTime = new Date(stream.stream.created_at),
                    secondsSince = Math.round((Date.now() - startedTime.getTime()) / 1000);
                helpers.serverMessage('Stream uptime: ' + secondsToLength(secondsSince), true);
            } else {
                helpers.serverMessage('Stream offline', true);
            }
        }).fail(function() {
            helpers.serverMessage('Could not fetch start time.', true);
        });
    } else if (command === '/viewers') {
        bttv.TwitchAPI.get('streams/' + channelName).done(function(stream) {
            helpers.serverMessage('Current Viewers: ' + Twitch.display.commatize(stream.stream.viewers), true);
        }).fail(function() {
            helpers.serverMessage('Could not fetch viewer count.', true);
        });
    } else if (command === '/w' && bttv.settings.get('disableWhispers') === true) {
        helpers.serverMessage('You have disabled whispers in BetterTTV settings');
    } else if (command === '/color') {
        helpers.serverMessage('Your current color is set to: ' + helpers.getColor(vars.userData.name), true);
        return false;
    } else if (command === '/help') {
        helpers.serverMessage('BetterTTV Chat Commands:');
        helpers.serverMessage('/b [username] -- Shortcut for /ban');
        helpers.serverMessage('/chatters -- Tells you how many users are currently in chat');
        helpers.serverMessage('/followed -- Tells you for how long you have been following a channel');
        helpers.serverMessage('/followcount -- Retrieves the number of followers for the channel');
        helpers.serverMessage('/join -- Joins the channel (deactivates anon chat mode)');
        helpers.serverMessage('/linehistory on/off -- Toggles the chat field history (pressing up/down arrow in textbox)');
        helpers.serverMessage('/localascii -- Turns on local ascii-only mode (only your chat is ascii-only mode)');
        helpers.serverMessage('/localasciioff -- Turns off local ascii-only mode');
        helpers.serverMessage('/localmod -- Turns on local mod-only mode (only your chat is mod-only mode)');
        helpers.serverMessage('/localmodoff -- Turns off local mod-only mode');
        helpers.serverMessage('/localsub -- Turns on local sub-only mode (only your chat is sub-only mode)');
        helpers.serverMessage('/localsuboff -- Turns off local sub-only mode');
        helpers.serverMessage('/massunban (or /unban all or /u all) -- Unbans all users in the channel (channel owner only)');
        helpers.serverMessage('/part -- Parts the channel (activates anon chat mode)');
        helpers.serverMessage('/purge [username] (or /p) -- Purges a user\'s chat');
        helpers.serverMessage('/r -- Type \'/r \' to respond to your last whisper');
        helpers.serverMessage('/shrug -- Appends your chat line with a shrug face');
        helpers.serverMessage('/sub -- Shortcut for /subscribers');
        helpers.serverMessage('/suboff -- Shortcut for /subscribersoff');
        helpers.serverMessage('/t [username] [time in seconds] -- Shortcut for /timeout');
        helpers.serverMessage('/u [username] -- Shortcut for /unban');
        helpers.serverMessage('/uptime -- Retrieves the amount of time the channel has been live');
        helpers.serverMessage('/viewers -- Retrieves the number of viewers watching the channel');
        helpers.serverMessage('Native Chat Commands:');
        return false;
    } else {
        return false;
    }
    return true;
};

exports.countUnreadMessages = function() {
    var controller = bttv.getChatController(),
        channels = rooms.getRooms(),
        unreadChannels = 0;

    channels.forEach(function(channel) {
        channel = rooms.getRoom(channel);
        if (channel.unread > 0) {
            unreadChannels++;
        }
        try {
            channel.emberRoom.set('unreadCount', channel.unread);
        } catch (e) {
            debug.log('Error setting unread count! Ember controller for channel must be removed.');
        }
    });
    controller.set('notificationsCount', unreadChannels);
};

var shiftQueue = exports.shiftQueue = throttle(function() {
    if (!tmi()) return;
    var channelName = tmi().get('id');
    if (channelName !== store.currentRoom && tmi().get('name')) {
        $('.chat-messages .chat-line').remove();
        store.currentRoom = channelName;
        store.__messageQueue = [];
        rooms.getRoom(channelName).playQueue();
        helpers.serverMessage('You switched to: ' + tmi().get('name').replace(/</g, '&lt;').replace(/>/g, '&gt;'), true);

        // TODO: this should not have to be here
        if (tmi().tmiRoom.isGroupRoom) {
            $('#bttv-channel-state-contain').hide();
        } else {
            $('#bttv-channel-state-contain').show();
        }
    } else {
        if ($('#right_col').css('display') === 'none') return;
        if (store.__messageQueue.length === 0) return;
        if (store.__messageQueue.length > bttv.settings.get('scrollbackAmount')) {
            store.__messageQueue.splice(0, store.__messageQueue.length - bttv.settings.get('scrollbackAmount'));
        }

        var queue = store.__messageQueue;
        var timeNow = Date.now();
        var isMod = vars.userData.isLoggedIn && helpers.isModerator(vars.userData.name);
        var delay = isMod ? 0 : rooms.getRoom(channelName).delay * 1000;
        var messagesToPrint = [];
        var messagesToPrepend = [];

        while (queue.length && (timeNow - queue[0].date.getTime() >= delay || queue[0].prepend)) {
            var item = queue.shift();
            var $message = item.message;
            if (item.prepend) {
                messagesToPrepend.unshift(item);
            } else {
                messagesToPrint.push($message);
            }
            $message.find('img').on('load', function() {
                helpers.scrollChat();
            });
        }

        if (queue.length !== messagesToPrint.length) {
            setTimeout(function() {
                shiftQueue();
            }, delay);
        }

        $chatLines = $('.chat-messages .chat-lines');

        if (messagesToPrepend.length) {
            messagesToPrepend = messagesToPrepend.filter(function(m) {
                return !$chatLines.find('.chat-line[data-id="' + m.message.data('id') + '"]').length;
            });
            var welcomeToChatLine = $chatLines.find('.chat-line.admin');
            if (welcomeToChatLine.length) {
                messagesToPrepend.sort(function(a, b) {
                    return a.date - b.date;
                });
                welcomeToChatLine.first().before(messagesToPrepend.map(function(m) {
                    return m.message;
                }));
            } else {
                store.__messageQueue = messagesToPrepend.concat(store.__messageQueue);
            }
        }

        $chatLines.append(messagesToPrint);
    }
    helpers.scrollChat();
}, 250, { trailing: true });

exports.moderationCard = function(user, $event) {
    var makeCard = require('../features/make-card');

    bttv.TwitchAPI.get('channels/' + user.toLowerCase(), {}, { version: 3 }).done(function(userApi) {
        if (!userApi.name) {
            makeCard({ name: userApi, display_name: userApi.capitalize() }, $event);
            return;
        }

        // Since we've fetched the data, let's store the display name
        if (userApi.display_name) {
            store.displayNames[user] = userApi.display_name;
        }

        makeCard(userApi, $event);
    }).fail(function() {
        makeCard({ name: user, display_name: user.capitalize() }, $event);
    });
};

exports.clearChat = function(bttvRoom, user, info, pubsub) {
    pubsub = pubsub || false;
    var trackTimeouts = store.trackTimeouts;

    // Remove chat image preview if it exists.
    // We really shouldn't have to place this here, but since we don't emit events...
    $('#chat_preview').remove();

    // clearchat is from an inactive room
    if (!bttvRoom.active()) return;

    if (!user) {
        helpers.serverMessage('Chat was cleared by a moderator (Prevented by BetterTTV)', true);
    } else {
        var isTarget = vars.userData.isLoggedIn && user === vars.userData.name;
        var isMod = vars.userData.isLoggedIn && helpers.isModerator(vars.userData.name);

        var printedChatLines = [];
        $('.chat-line[data-sender="' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '"]').each(function() {
            printedChatLines.push($(this));
        });

        var queuedLines = store.__messageQueue.filter(function(m) {
            if (m.message.data('sender') === user) return true;
            return false;
        }).map(function(m) {
            return m.message;
        });

        $chatLines = $(printedChatLines.concat(queuedLines));

        if (!$chatLines.length && !isTarget) return;

        if (bttv.settings.get('hideDeletedMessages') === true ||
            (bttv.settings.get('showDeletedMessages') !== true && bttvRoom.delay && !isMod && !isTarget)
        ) {
            $chatLines.each(function() {
                $(this).hide();
                $('div.tipsy').remove();
            });
            setTimeout(function() {
                $('.chat-line .mod-icons .bot, .chat-line .mod-icons .oldbot').each(function() {
                    $(this).parent().parent().find("span.message:contains('" + user.replace(/%/g, '_').replace(/[<>,]/g, '') + "')").each(function() {
                        $(this).parent().hide();
                    });
                });
            }, 3000);
        } else {
            if (bttv.settings.get('showDeletedMessages') !== true) {
                $chatLines.each(function() {
                    var $message = $(this).find('.message');

                    $message.addClass('timed-out');
                    $message.html('<span class="deleted">&lt;message deleted&gt;</span>').off('click').on('click', function() {
                        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw'))));
                    });
                });
            } else {
                $chatLines.each(function() {
                    var $message = $(this).find('.message');
                    $('a', $message).each(function() {
                        var rawLink = '<span style="text-decoration: line-through;">' + $(this).attr('href').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
                        $(this).replaceWith(rawLink);
                    });
                    $('.emoticon', $message).each(function() {
                        $(this).css('opacity', '0.1');
                    });
                    $message.addClass('timed-out');
                    $message.html('<span class="deleted">' + $message.html() + '</span>');
                });
            }

            // Update channel state with timeout duration
            if (isTarget) {
                channelState({
                    type: 'notice',
                    tags: {
                        'msg-id': info['ban-duration'] ? 'msg_timedout' : 'msg_banned',
                    },
                    message: info['ban-duration']
                });
            }

            // Timeout messages
            if (bttv.settings.get('hideDeletedMessages') === true && !isTarget) return;
            if (isMod && bttv.storage.getObject('chatSettings').showModerationActions !== true) return;

            if (trackTimeouts[user]) {
                Object.assign(trackTimeouts[user].info, info);
                info = trackTimeouts[user].info;
            }

            var message;
            var reason = info['ban-reason'] ? ' Reason: ' + templates.escape(info['ban-reason']) : '';
            var type = info['ban-duration'] ? 'timed out for ' + templates.escape(info['ban-duration']) + ' seconds' : 'banned from this room';
            var typeSimple = info['ban-duration'] ? 'timed out.' : 'banned.';
            var by = info['ban-created-by'] ? ' by ' + info['ban-created-by'] : '';

            if (isTarget) {
                message = 'You have been ' + type + '.' + reason;
            } else if (isMod) {
                message = helpers.lookupDisplayName(user) + ' has been ' + type + by + '.' + reason;
            } else {
                message = helpers.lookupDisplayName(user) + ' has been ' + typeSimple;
            }

            var timesID = trackTimeouts[user] ? trackTimeouts[user].timesID : Math.floor(Math.random() * 100001);
            var spanID = 'times_from_' + user.replace(/%/g, '_').replace(/[<>,]/g, '') + '_' + timesID;

            if (trackTimeouts[user]) {
                if (!pubsub) trackTimeouts[user].count++;
                $('#' + spanID).each(function() {
                    $(this).text(message);
                });
            } else {
                trackTimeouts[user] = {
                    count: 1,
                    timesID: timesID,
                    info: info
                };
                helpers.serverMessage('<span id="' + spanID + '">' + message + '</span>', true);
            }
        }
    }
};

exports.notice = function(data) {
    var messageId = data.msgId;
    var message = data.message;

    channelState({
        type: 'notice',
        tags: {
            'msg-id': messageId
        },
        message: message
    });

    // Same message as CLEARCHAT, need to filter until twitch removes it
    if (messageId === 'timeout_success' || messageId === 'ban_success') return;

    helpers.serverMessage(message, true);
};

var privmsg = exports.privmsg = function(channel, data) {
    // Store display names
    var message;
    if (data.tags && data.tags['display-name']) {
        store.displayNames[data.from] = data.tags['display-name'];
    }

    if (data.tags && data.tags['msg-id'] === 'resub') {
        message = templates.privmsg({
            nickname: 'jtv',
            message: data.tags['system-msg'],
            time: timestamp(data.date),
            badges: [{type: 'subscriber', name: '', description: 'Channel Subscriber'}],
            color: '#555'
        }, {server: true, notice: true});

        store.__messageQueue.push({message: $(message), date: new Date(0)});
    }

    try {
        tmi().trackLatency(data);
    } catch (e) {
        debug.log('Error sending tracking data to Twitch');
    }

    if (!data.message || !data.message.length) return;

    if (data.message.substr(0, 5) === ':act ') return;

    if (data.style && ['admin', 'action', 'notification', 'whisper'].indexOf(data.style) === -1) return;

    var blacklistFilter = require('../features/keywords-lists').blacklistFilter,
        highlighting = require('../features/keywords-lists').highlighting;

    if (bttv.settings.get('blacklistKeywords')) {
        if (blacklistFilter(data)) return;
    }

    if (data.style === 'admin' || data.style === 'notification') {
        if (data.message.indexOf('Sorry, we were unable to connect to chat.') > -1 && store.ignoreDC === true) {
            store.ignoreDC = false;
            return;
        }

        if (data.isModerationMessage && bttv.storage.getObject('chatSettings').showModerationActions !== true) return;

        data.style = 'admin';
        message = templates.privmsg({
            message: data.message,
            time: data.date ? timestamp(data.date) : '',
            nickname: data.from || 'jtv',
            sender: data.from,
            badges: data.badges || (data.from === 'twitchnotify' ? [{
                type: 'subscriber',
                name: '',
                description: 'Channel Subscriber'
            }] : []),
            color: '#555',
            emotes: data.tags && data.tags.emotes,
        }, {
            action: data.style === 'action' ? true : false,
            server: data.style === 'admin' ? true : false,
            isMod: vars.userData.isLoggedIn ? helpers.isModerator(vars.userData.name) : false,
            notice: data.message.indexOf('subscribed!') > 0
        });

        $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
        helpers.scrollChat();
        return;
    }

    if (!store.chatters[data.from]) store.chatters[data.from] = {lastWhisper: 0};

    if (store.trackTimeouts[data.from]) delete store.trackTimeouts[data.from];

    var messageHighlighted = bttv.settings.get('highlightKeywords') && highlighting(data);

	// Pinned Highlights
    if (messageHighlighted) {
        pinnedHighlights(data);
    }

    // Strawpoll
    embeddedPolling(data);

    data.color = (data.tags && data.tags.color && data.tags.color.length) ? data.tags.color : helpers.getColor(data.from);

    data.color = helpers.calculateColor(data.color);

    if (helpers.hasGlow(data.from) && data.style !== 'action') {
        var rgbColor = (data.color === '#ffffff' ? getRgb('#000000') : getRgb(data.color));
        if (bttv.settings.get('darkenedMode') === true) data.color = data.color + '; text-shadow: 0 0 20px rgba(' + rgbColor.r + ',' + rgbColor.g + ',' + rgbColor.b + ',0.8)';
    }

    var bttvBadges = helpers.assignBadges(data.tags.badges || {}, data);

    var from = data.from;
    var sender = data.from;

    if (data.bttvDisplayName) {
        helpers.lookupDisplayName(data.from);
        from = data.bttvDisplayName;
    } else {
        from = helpers.lookupDisplayName(data.from);
    }

    // handle twitch whispers
    if (data.style === 'whisper') {
        var toColor = helpers.getColor(data.to);
        toColor = helpers.calculateColor(toColor);

        message = templates.whisper({
            message: data.message,
            time: data.date ? timestamp(data.date) : '',
            from: from,
            sender: sender,
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

    if (vars.localSubsOnly && !helpers.isModerator(data.from) && !helpers.isSubscriber(data.from)) return;
    if (vars.localModsOnly && !helpers.isModerator(data.from)) return;
    if (vars.localAsciiOnly) {
        for (var i = 0; i < data.message.length; i++) {
            if (data.message.charCodeAt(i) > 128) return;
        }
    }

    message = templates.privmsg({
        message: data.message,
        time: timestamp(data.date),
        nickname: from,
        sender: sender,
        badges: bttvBadges,
        color: data.color,
        bits: data.tags.bits && parseInt(data.tags.bits, 10),
        emotes: data.tags.emotes,
        id: data.tags.id
    }, {
        highlight: messageHighlighted,
        action: data.style === 'action' ? true : false,
        server: data.style === 'admin' ? true : false,
        isMod: vars.userData.isLoggedIn ? (helpers.isModerator(vars.userData.name) && (!helpers.isModerator(sender) || (vars.userData.name === channel && vars.userData.name !== sender))) : false,
        notice: data.tags && data.tags['msg-id'] === 'resub'
    });

    store.__messageQueue.push({message: $(message), date: sender === vars.userData.name ? new Date(0) : data.date, prepend: data.tags.historical ? true : false});
};

exports.onPrivmsg = function(channel, data) {
    if (!rooms.getRoom(channel).active() && data.from && data.from !== 'jtv') {
        rooms.getRoom(channel).queueMessage(data);
        return;
    }
    if (!tmi() || !tmi().tmiRoom) return;
    try {
        if (data.style === 'whisper') {
            store.chatters[data.from] = {lastWhisper: Date.now()};
            if (bttv.settings.get('disableWhispers') === true) return;
            if (data.from !== vars.userData.name) {
                if (bttv.chat.store.activeView === false) {
                    if (bttv.settings.get('highlightFeedback') === true) {
                        audibleFeedback.play();
                    }
                    if (bttv.settings.get('desktopNotifications') === true) {
                        bttv.notify('You received a whisper from ' + ((data.tags && data.tags['display-name']) || data.from));
                    }
                }
            }
        }
        privmsg(channel, data);
        shiftQueue();
    } catch (e) {
        if (store.__reportedErrors.indexOf(e.message) !== -1) return;
        store.__reportedErrors.push(e.message);
        debug.log(e);
        var error = {
            stack: e.stack,
            message: e.message
        };
        $.get('https://nightdev.com/betterttv/errors/?obj=' + encodeURIComponent(JSON.stringify(error)));
        helpers.serverMessage('BetterTTV encountered an error reading chat. The developer has been sent a log of this action. Please try clearing your cookies and cache.');
    }
};

