var vars = require('../vars'),
    keyCodes = require('../keycodes'),
    tmi = require('./tmi'),
    store = require('./store'),
    templates = require('./templates'),
    bots = require('../bots'),
    punycode = require('punycode'),
    channelState = require('../features/channel-state');

// Helper functions
var removeElement = require('../helpers/element').remove;
var escapeRegExp = require('../helpers/regex').escapeRegExp;
var calculateColorBackground = require('../helpers/colors').calculateColorBackground;
var calculateColorReplacement = require('../helpers/colors').calculateColorReplacement;

var lookupDisplayName = exports.lookupDisplayName = function(user) {
    if(!user || user === "") return;

    // There's no display-name when sending messages, so we'll fill in for that
    if(vars.userData.isLoggedIn && user === vars.userData.login) {
        store.displayNames[user] = Twitch.user.displayName() || user;
    }
    
    // Get subscription status (Night's subs)
    bttv.io.lookupUser(user);

    if(tmi()) {
        if(store.displayNames.hasOwnProperty(user)) {
            return store.displayNames[user] || user.capitalize();
        } else if(user !== "jtv" && user !== "twitchnotify") {
            return user.capitalize();
        } else {
            return user;
        }
    } else {
        return user.capitalize();
    }
};
var tcCommands = [
    'mod',
    'unmod',
    'ban',
    'unban',
    'timeout',
    'purge',
    'host',
    'unhost',
    'b',
    't',
    'u',
    'w',
    'p'
];
var detectServerCommand = function(input) {
    var input = input.split(' ');

    if(input.length < 2) return false;

    input.pop();
    checkCommand = input[input.length - 1];

    if(input[0] !== checkCommand) return false;

    for(var i = 0; i < tcCommands.length; i++) {
        var r = new RegExp('^(\\/|\\.)' + tcCommands[i] + '$', 'i');

        if(r.test(checkCommand)) return true;
    }

    return false;
};
var parseTags = exports.parseTags = function(tags) {
    var rawTags = tags.slice(1, tags.length).split(';');

    tags = {};

    for(var i = 0; i < rawTags.length; i++) {
        var tag = rawTags[i];
        var pair = tag.split('=');
        tags[pair[0]] = pair[1];
    }

    return tags;
};
var parseRoomState = exports.parseRoomState = function(e) {
    try {
        channelState({
            type: 'roomstate',
            tags: e.tags
        });
    } catch(e) {
        debug.log('Couldn\'t handle roomstate update.', e);
    }
};
var completableEmotes = function() {
    var completableEmotes = [];

    bttv.chat.emotes().forEach(function(emote) {
        if(!emote.text) return;

        completableEmotes.push(emote.text);
    });

    try {
        var usableEmotes = tmi().tmiSession._emotesParser.emoticonRegexToIds;

        for(var emote in usableEmotes) {
            if(!usableEmotes.hasOwnProperty(emote)) continue;

            if(usableEmotes[emote].isRegex === true) continue;

            completableEmotes.push(emote);
        }
    } catch(e) {
        debug.log('Couldn\'t grab user emotes for tab completion.', e);
    }

    return completableEmotes;
};
var tabCompletion = exports.tabCompletion = function(e) {
    var keyCode = e.keyCode || e.which;
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');

    var input = $chatInput.val();
    var sentence = input.trim().split(' ');
    var lastWord = sentence.pop().replace(/,$/, '');

    // If word is an emote, casing is important
    var emotes = completableEmotes();
    if(emotes.indexOf(lastWord) === -1) {
        lastWord = lastWord.toLowerCase();
    }

    if((detectServerCommand(input) || keyCode === keyCodes.Tab || lastWord.charAt(0) === '@') && keyCode !== keyCodes.Enter) {
        var sugStore = store.suggestions;

        var currentMatch = lastWord.replace(/^@/, '');
        var currentIndex = sugStore.matchList.indexOf(currentMatch);

        var user;

        if(currentMatch === sugStore.lastMatch && currentIndex > -1) {
            var nextIndex;
            var prevIndex;

            if(currentIndex+1 < sugStore.matchList.length) {
                nextIndex = currentIndex+1;
            } else {
                nextIndex = sugStore.matchList.length-1;
            }

            if(currentIndex-1 >= 0) {
                prevIndex = currentIndex-1;
            } else {
                prevIndex = 0;
            }

            var index = e.shiftKey ? prevIndex : nextIndex;

            user = sugStore.matchList[index];

            if(sugStore.matchList.length < 6) {
                suggestions(sugStore.matchList, index);
            } else {
                var slice;

                if(index-2 < 0) {
                    slice = 0;
                } else if(index+2 > sugStore.matchList.length-1) {
                    slice = sugStore.matchList.length-5;
                    index = (index === sugStore.matchList.length-1) ? 4 : 3;
                } else {
                    slice = index-2;
                    index = 2;
                }

                suggestions(sugStore.matchList.slice(slice,slice+5), index);
            }
        } else {
            var search = currentMatch;
            var users = Object.keys(store.chatters);

            var recentWhispers = [];

            if (detectServerCommand(input)) {
                for (var i = users.length; i >= 0; i--) {
                    if (store.chatters[users[i]] !== undefined && store.chatters[users[i]].lastWhisper !== 0) {
                        recentWhispers.push(users[i]);
                        users.splice(i,1);
                    }
                }

                recentWhispers.sort(function(a, b) {
                    return store.chatters[b].lastWhisper - store.chatters[a].lastWhisper;
                });
            }

            users.sort();
            users = recentWhispers.concat(users);

            // Mix in emotes if not directly asking for a user
            if(lastWord.charAt(0) !== '@' && !detectServerCommand(input)) {
                users = users.concat(emotes);
            }

            if (users.indexOf(vars.userData.login) > -1) users.splice(users.indexOf(vars.userData.login), 1);

            if(/^(\/|\.)/.test(search)) {
                search = '';
            }

            if(search.length) {
                users = users.filter(function(user) {
                    var lcUser = user.toLowerCase();
                    return (lcUser.search(search) === 0);
                });
            }

            if(!users.length) return;

            sugStore.matchList = users;

            suggestions(users.slice(0,5), 0);

            user = users[0];
        }

        var $suggestions = $chatInterface.find('.suggestions');
        setTimeout(function(){
            $suggestions.remove();
        }, 10000);

        if(keyCode !== keyCodes.Tab) return;

        sugStore.lastMatch = user;

        // Casing is important for emotes
        var isEmote = true;
        if(emotes.indexOf(user) === -1) {
            user = lookupDisplayName(user);
            isEmote = false;
        }

        if(/^(\/|\.)/.test(lastWord)) {
            user = lastWord + ' ' + user;
            $chatInput.val(user);
            return;
        }

        if(lastWord.charAt(0) === '@') {
            user = '@'+user;
        }

        sentence.push(user);

        if(sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ", ");
        } else {
            $chatInput.val(sentence.join(' '));
        }
    }
};
var whisperReply = exports.whisperReply = function(e) {
    var $chatInput = $('.ember-chat .chat-interface').find('textarea');
    if ($chatInput.val() === '/r ' && bttv.settings.get('disableWhispers') === false) {
        var to = ($.grep(store.__rooms[store.currentRoom].messages, function(msg) {
            return (msg.style === 'whisper' && msg.from.toLowerCase() !== vars.userData.login);
        }).pop() || {from:null}).from;
        if (to) {
            $chatInput.val('/w ' + to + ' ');
        } else {
            $chatInput.val('');
            serverMessage('You have not received any whispers', true);
        }
    }
};
var chatLineHistory = exports.chatLineHistory = function($chatInput, e) {
    if(bttv.settings.get('chatLineHistory') === false) return;

    var keyCode = e.keyCode || e.which;
    var $chatInterface = $('.ember-chat .chat-interface');

    var historyIndex = store.chatHistory.indexOf($chatInput.val().trim());
    if(keyCode === keyCodes.UpArrow) {
        if(historyIndex >= 0) {
            if(store.chatHistory[historyIndex+1]) {
                $chatInput.val(store.chatHistory[historyIndex+1]);
            }
        } else {
            if($chatInput.val().trim().length) {
                store.chatHistory.unshift($chatInput.val().trim());
                $chatInput.val(store.chatHistory[1]);
            } else {
                $chatInput.val(store.chatHistory[0]);
            }
        }
    } else if(keyCode === keyCodes.DownArrow) {
        if(historyIndex >= 0) {
            if(store.chatHistory[historyIndex-1]) {
                $chatInput.val(store.chatHistory[historyIndex-1]);
            } else {
                $chatInput.val('');
            }
        }
    }
};
var suggestions = exports.suggestions = function(words, index) {
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $suggestions = $chatInterface.find('.suggestions');
    if($suggestions.length) $suggestions.remove();

    var input = $chatInput.val();
    var sentence = input.trim().split(' ');
    var lastWord = sentence.pop();
    if(
        lastWord.charAt(0) !== '@' &&
        !detectServerCommand(input) &&
        bttv.settings.get('tabCompletionTooltip') === false
    ) {
        return;
    }

    $suggestions = $chatInterface.find('.textarea-contain').append(templates.suggestions(words, index)).find('.suggestions');
    $suggestions.find('.suggestion').on('click', function() {
        var user = $(this).text();
        var sentence = $chatInput.val().trim().split(' ');
        var lastWord = (detectServerCommand(input) && !sentence[1]) ? '' : sentence.pop();

        var isEmote = (completableEmotes().indexOf(user) !== -1);

        if(!isEmote) {
            if(lastWord.charAt(0) === '@') {
                sentence.push("@" + lookupDisplayName(user));
            } else {
                sentence.push(lookupDisplayName(user));
            }
        } else {
            sentence.push(user);
        }

        if(sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ", ");
        } else {
            $chatInput.val(sentence.join(' ') + " ");
        }

        $suggestions.remove();
    }).on('mouseover', function() {
        var $firstElement = $suggestions.find('.suggestion').eq(0);
        $firstElement.parent().removeClass('highlighted');

        $(this).parent().addClass('highlighted');
    }).on('mouseout', function() {
        $(this).parent().removeClass('highlighted');
    });
    $suggestions.on('click', function() {
        $(this).remove();
    });
};
var serverMessage = exports.serverMessage = function(message, displayTimestamp) {
    var handlers = require('./handlers');
    handlers.onPrivmsg(store.currentRoom, {
        from: 'jtv',
        date:  displayTimestamp ? new Date() : null,
        message: message,
        style: 'admin'
    });
};
var notifyMessage = exports.notifyMessage = function (type, message) {
    var handlers = require('./handlers');
    var tagType = (bttv.settings.get("showJTVTags") === true && ["moderator","broadcaster","admin","global-moderator","staff","bot"].indexOf(type) !== -1) ? 'old'+type : type;
    handlers.onPrivmsg(store.currentRoom, {
        from: 'twitchnotify',
        date: new Date(),
        badges: [{
                    type: tagType,
                    name: ((bttv.settings.get("showJTVTags") && type !== "subscriber" && type !== "turbo")?type.capitalize():''),
                    description: tagType.capitalize()
        }],
        message: message,
        style: 'notification'
    });
};
var sendMessage = exports.sendMessage = function(message) {
    if(!message || message === "") return;
    if(tmi()) {
        if(!vars.userData.isLoggedIn) {
            try {
                window.Ember.$.login();
            } catch(e) {
                serverMessage('You must be logged into Twitch to send messages.');
            }

            return;
        }

        if(bttv.settings.get('anonChat') === true) {
            serverMessage('You can\'t send messages when Anon Chat is enabled. You can disable Anon Chat in the BetterTTV settings.');
            return;
        }

        if(message.charAt(0) === '/' || message.charAt(0) === '.') {
            message = message.split(' ');
            message[0] = message[0].toLowerCase();
            message = message.join(' ');
        }

        tmi().tmiRoom.sendMessage(message);

        try {
            if(!/^\/w(\s|$)/.test(message)) {
                channelState({
                    type: 'outgoing_message'
                });
                tmi().trackSubOnly(message);
                tmi().trackChat();
            }
        } catch(e) {
            debug.log('Error sending tracking data to Twitch');
        }

        // Fixes issue when using Twitch's sub emote selector
        tmi().set('messageToSend', '');
        tmi().set('savedInput', '');
    }
};
var reparseMessages = exports.reparseMessages = function(user) {
    if(!user || !user.length) return;

    bttv.jQuery('.chat-line[data-sender="' + user + '"] .message').each(function() {
        var message = $(this);

        var rawMessage = decodeURIComponent(message.data('raw'));
        var emotes = message.data('emotes') ? JSON.parse(decodeURIComponent(message.data('emotes'))) : false;
        var color = message.attr('style') ? message.attr('style').split(': ')[1] : false;

        message.replaceWith(templates.message(user, rawMessage, emotes, color));
    });
};
var listMods = exports.listMods = function() {
    if(tmi()) return tmi().tmiRoom._roomUserLabels._sets;
    return {};
};
var addMod = exports.addMod = function(user) {
    if(!user || user === "") return false;
    if(tmi()) tmi().tmiRoom._roomUserLabels.add(user, 'mod');
};
var removeMod = exports.removeMod = function(user) {
    if(!user || user === "") return false;
    if(tmi()) tmi().tmiRoom._roomUserLabels.remove(user, 'mod');
};
var isIgnored = exports.isIgnored = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiSession.isIgnored(user);
};
var isOwner = exports.isOwner = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('owner') !== -1;
};
var isAdmin = exports.isAdmin = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('admin') !== -1;
};
var isGlobalMod = exports.isGlobalMod = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('global_mod') !== -1;
};
var isStaff = exports.isStaff = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('staff') !== -1;
};
var isModerator = exports.isModerator = function(user) {
    if(!user || user === "") return false;
    return tmi() && (tmi().tmiRoom.getLabels(user).indexOf('mod') !== -1 || 
                    isAdmin(user) || isStaff(user) || isOwner(user) || isGlobalMod(user));
};
var isTurbo = exports.isTurbo = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('turbo') !== -1;
};
var isSubscriber = exports.isSubscriber = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('subscriber') !== -1;
};
var getBadges = exports.getBadges = function(user) {
    if(!user || user === "") return false;
    var badges = [];
    if(tmi() && tmi().tmiRoom.getLabels(user)) badges = tmi().tmiRoom.getLabels(user);
    if(store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) badges.push("subscriber");
    if(store.__channelBots.indexOf(user) > -1 || (bots.indexOf(user) > -1 && isModerator(user))) badges.push("bot");
    return badges;
};
var hasGlow = exports.hasGlow = function(user) {
    if(!user || user === "") return false;
    if(store.__subscriptions[user] && store.__subscriptions[user].indexOf('_glow') !== -1) return true;
};
var getColor = exports.getColor = function(user) {
    if(!user || user === "") return false;
    return tmi() ? tmi().tmiSession.getColor(user) : null;
};
var getEmotes = exports.getEmotes = function(user) {
    if(!user || user === "") return false;
    var emotes = [];
    if(tmi() && tmi().tmiRoom.getEmotes && tmi().tmiRoom.getEmotes(user)) emotes = tmi().tmiRoom.getEmotes(user);
    if(store.__subscriptions[user]) {
        store.__subscriptions[user].forEach(function(channel) {
            emotes.push(channel);
        });
    }
    return emotes;
};
var getSpecials = exports.getSpecials = function(user) {
    if(!user || user === "") return false;
    var specials = [];
    if(tmi() && tmi().tmiSession && tmi().tmiSession._users) specials = tmi().tmiSession._users.getSpecials(user);
    if(store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) specials.push("subscriber");
    return specials;
};
var scrollChat = exports.scrollChat = function() {
    var $chat = $('.ember-chat');

    var chatPaused = $chat.find('.chat-interface').children('span').children('.more-messages-indicator').length;

    if(chatPaused || !$chat.length) return;

    var $chatMessages = $chat.find('.chat-messages');
    var $chatScroller = $chatMessages.children('.tse-scroll-content');
    var $chatLines = $chatScroller.children('.tse-content').children('.chat-lines').children('div.chat-line');

    setTimeout(function() {
        if(!$chatScroller.length) return;

        $chatScroller[0].scrollTop = $chatScroller[0].scrollHeight;
    });

    var linesToDelete = $chatLines.length - bttv.settings.get("scrollbackAmount");

    if(linesToDelete <= 0) return;

    $chatLines.slice(0, linesToDelete).each(function() {
        $(this).remove();
    });
};
var calculateColor = exports.calculateColor = function(color) {
    var colorRegex = /^#[0-9a-f]+$/i;
    if(colorRegex.test(color)) {
        while (((calculateColorBackground(color) === "light" && bttv.settings.get("darkenedMode") === true) || (calculateColorBackground(color) === "dark" && bttv.settings.get("darkenedMode") !== true))) {
            color = calculateColorReplacement(color, calculateColorBackground(color));
        }
    }

    return color;
};
var surrogateOffset = function(surrogates, index) {
    var offset = index;

    for(var id in surrogates) {
        if(!surrogates.hasOwnProperty(id)) continue;
        if(id < index) offset++;
    }

    return offset;
};
var handleSurrogatePairs = exports.handleSurrogatePairs = function(message, emotes) {
    // Entire message decoded to array of char codes, combines
    // surrogate pairs to a single index
    var decoded = punycode.ucs2.decode(message);

    var surrogates = {};
    for(var i = 0; i < decoded.length; i++) {
        // Not surrogate
        if(decoded[i] <= 0xFFFF) continue;

        surrogates[i] = true;
    }

    // We can loop through all emote ids and all indexes that id
    // appears in the message, offsetting the indexes +1 for each
    // surrogate pair occurring before the index
    for(var id in emotes) {
        if(!emotes.hasOwnProperty(id)) continue;

        var emote = emotes[id];
        for(var i = emote.length-1; i >= 0; i--) {
            for(var j = 0; j < emote[i].length; j++) {
                emote[i][j] = surrogateOffset(surrogates, emote[i][j]);
            }
        }
    }

    return emotes;
};
var loadBadges = exports.loadBadges = function() {
    if($('#bttv_volunteer_badges').length) return;

    $.getJSON("https://api.betterttv.net/2/badges").done(function(data) {
        var $style = $('<style />');

        $style.attr('id', 'bttv_volunteer_badges');

        data.types.forEach(function(badge) {
            $style.append(".ember-chat .badges .bttv-" + badge.name + " { background: url(\"" + badge.svg + "\"); background-size: 100%; }");
            store.__badgeTypes[badge.name] = badge;
        });

        $style.appendTo('head');

        data.badges.forEach(function(user) {
            store.__badges[user.name] = user.type;
        });
    });
};
var assignBadges = exports.assignBadges = function(badges, data) {
    data = data || {};
    var bttvBadges = [];
    var legacyTags = require('../legacy-tags')(data);

    if(badges.indexOf('staff') !== -1) {
        bttvBadges.push({
            type: 'staff',
            name: 'Staff',
            description: 'Twitch Staff'
        });
    } else if(badges.indexOf('admin') !== -1) {
        bttvBadges.push({
            type: 'admin',
            name: 'Admin',
            description: 'Twitch Admin'
        });
    } else if(badges.indexOf('global_mod') !== -1) {
        bttvBadges.push({
            type: 'global-moderator',
            name: 'GMod',
            description: 'Twitch Global Moderator'
        });
    } else if(badges.indexOf('bot') !== -1) {
        bttvBadges.push({
            type: 'bot',
            name: 'Bot',
            description: 'Channel Bot'
        });
    } else if(badges.indexOf('owner') !== -1 && !legacyTags[data.from]) {
        bttvBadges.push({
            type: 'broadcaster',
            name: 'Host',
            description: 'Channel Broadcaster'
        });
    } else if(badges.indexOf('mod') !== -1 && !legacyTags[data.from]) {
        bttvBadges.push({
            type: 'moderator',
            name: 'Mod',
            description: 'Channel Moderator'
        });
    }

    // Legacy Swag Tags
    if(
        legacyTags[data.from] &&
        (
            (
                legacyTags[data.from].mod === true && isModerator(data.from)
            ) ||
            legacyTags[data.from].mod === false
        )
    ) {
        var userData = legacyTags[data.from];

        // Shouldn't be setting color and nickname here, but it's legacy so
        if(userData.color && data.style !== 'action') data.color = userData.color;
        if(userData.nickname) data.bttvDisplayName = userData.nickname;

        bttvBadges.unshift({
            type: userData.tagType,
            name: userData.tagName,
            description: "Grandfathered BetterTTV Swag Tag"
        });
    }

    // Volunteer badges
    if(data.from in store.__badges) {
        var type = store.__badges[data.from];
        bttvBadges.push({
            type: 'bttv-' + type,
            name: '',
            description: store.__badgeTypes[type].description
        });
    }

    if(badges.indexOf('turbo') !== -1) {
        bttvBadges.push({
            type: 'turbo',
            name: '',
            description: 'Twitch Turbo'
        });
    }

    if(badges.indexOf('subscriber') !== -1) {
        bttvBadges.push({
            type: 'subscriber',
            name: '',
            description: 'Channel Subscriber'
        });
    }

    bttvBadges.forEach(function(badge) {
        if(
            bttv.settings.get("showJTVTags") === false &&
            badge.description !== "Grandfathered BetterTTV Swag Tag"
        ) {
            badge.name = "";
            return;
        }

        if(
            [
                "moderator",
                "broadcaster",
                "admin",
                "global-moderator",
                "staff",
                "bot"
            ].indexOf(badge.type) === -1
        ) {
            return;
        }

        badge.type = "old" + badge.type;
    });

    return bttvBadges;
};
var ban = exports.ban = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.banUser(user) : null;
};
var timeout = exports.timeout = function(user, time) {
    time = time || 600;
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.timeoutUser(user+' '+time) : null;
};
var unban = exports.unban = function(user) {
    if(!user || user === "") return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.unbanUser(user) : null;
};
var massUnban = exports.massUnban = function() {
    if(!vars.userData.isLoggedIn || vars.userData.login !== bttv.getChannel()) {
        serverMessage("You're not the channel owner.");
        return;
    }

    var bannedUsers = [];
    serverMessage("Fetching banned users...");
    $.ajax({url: "/settings/channel", cache: !1, timeoutLength: 6E3, dataType: 'html'}).done(function (chatInfo) {
        if(chatInfo) {
            $(chatInfo).find("#banned_chatter_list .ban .obj").each(function() {
                var user = $(this).text().trim();
                if(store.__unbannedUsers.indexOf(user) === -1 && bannedUsers.indexOf(user) === -1) bannedUsers.push(user);
            });
            if(bannedUsers.length > 0) {
                serverMessage("Fetched "+bannedUsers.length+" banned users.");
                if(bannedUsers.length > 10) {
                    serverMessage("Starting purge process in 5 seconds. Get ready for a spam fest!");
                } else {
                    serverMessage("Starting purge process in 5 seconds.");
                }
                serverMessage("By my calculations, this block of users will take "+(bannedUsers.length*.333).toFixed(1)+" minutes to unban.");
                if(bannedUsers.length > 70) serverMessage("Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.");
                setTimeout(function() {
                    var startTime = 0;
                    bannedUsers.forEach(function(user) {
                        setTimeout(function() {
                            unban(user);
                            store.__unbannedUsers.push(user);
                        }, startTime += 333);
                    });
                    setTimeout(function() {
                        serverMessage("This block of users has been purged. Checking for more..");
                        massUnban();
                    }, startTime += 333);
                }, 5000);
            } else {
                serverMessage("You have no banned users.");
                store.__unbannedUsers = [];
            }
        }
    });
};
var translate = exports.translate = function($element, sender, text) {
    var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en';

    var qs = $.param({
        target: language,
        q: text
    });

    $.getJSON('https://api.betterttv.net/2/translate?' + qs).success(function(data) {
        $element.replaceWith(templates.message(sender, data.translation));
    }).error(function(data) {
        if(data.responseJSON && data.responseJSON.message) {
            $element.text(data.responseJSON.message);
        } else {
            $element.text("Translation Error");
        }
    });
};
