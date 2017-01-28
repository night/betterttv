var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes'),
    tmi = require('./tmi'),
    store = require('./store'),
    templates = require('./templates'),
    bots = require('../bots'),
    punycode = require('punycode'),
    channelState = require('../features/channel-state'),
    chatFreeze = require('../features/chat-freeze'),
    throttle = require('lodash.throttle'),
    emojilib = require('emojilib');

// Helper functions
var calculateColorBackground = require('../helpers/colors').calculateColorBackground;
var calculateColorReplacement = require('../helpers/colors').calculateColorReplacement;

var lookupDisplayName = exports.lookupDisplayName = function(user, nicknames) {
    if (!user) return '';

    // There's no display-name when sending messages, so we'll fill in for that
    if (vars.userData.isLoggedIn && user === vars.userData.name) {
        store.displayNames[user] = vars.userData.displayName || user;
    }

    if (nicknames !== false) {
        nicknames = bttv.storage.getObject('nicknames');
        if (user in nicknames) return ( nicknames[user] || user.capitalize() );
    }

    if (tmi()) {
        if (Object.hasOwnProperty.call(store.displayNames, user)) {
            var name = store.displayNames[user] || user.capitalize();
            if (name.toLowerCase() !== user && (nicknames === false || bttv.settings.get('disableLocalizedNames') === true)) {
                return user.capitalize();
            }
            return  name;
        } else if (user !== 'jtv' && user !== 'twitchnotify') {
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
    input = input.split(' ');

    if (input.length < 2) return false;

    input.pop();
    var checkCommand = input[input.length - 1];

    if (input[0] !== checkCommand) return false;

    for (var i = 0; i < tcCommands.length; i++) {
        var r = new RegExp('^(\\/|\\.)' + tcCommands[i] + '$', 'i');

        if (r.test(checkCommand)) return true;
    }

    return false;
};

var bitsServiceCache;
var getBitsService = function() {
    if (bitsServiceCache) return bitsServiceCache;
    if (!App || !App.__container__.lookup('service:bits-emotes')) return;
    bitsServiceCache = App.__container__.lookup('service:bits-emotes');
    return bitsServiceCache;
};

var containsCheer = function(msg) {
    var service = getBitsService();
    if (!service) return false;

    words = msg ? msg.split(/\s+/) : [];
    return words.some(function(w) {
        return service.regexes.some(function(r) {
            return w.match(r.valid);
        });
    });
};

exports.getCheerConfig = function(piece) {
    var service = getBitsService();
    if (!service) return;

    var config;
    for (var i = 0; i < service.regexes.length; i++) {
        if (piece.match(service.regexes[i].valid)) {
            var key = service.regexes[i].prefix.toLowerCase();
            config = service.emoteConfig[key];
        }
    }
    return config;
};

exports.dismissPinnedCheer = function() {
    try {
        var service = window.App.__container__.lookup('service:bits-pinned-cheers');
        if (service.topPinnedCheer || service.recentPinnedCheer) service.dismissLocalMessage();
    } catch (dismissError) {
        debug.log('Failed to dismiss cheer:', dismissError);
    }
};

exports.parseTags = function(tags) {
    var rawTags = tags.slice(1, tags.length).split(';');

    tags = {};

    for (var i = 0; i < rawTags.length; i++) {
        var tag = rawTags[i];
        var pair = tag.split('=');
        tags[pair[0]] = pair[1];
    }

    return tags;
};

exports.parseRoomState = function(e) {
    try {
        channelState({
            type: 'roomstate',
            tags: e.tags
        });
    } catch (err) {
        debug.log('Couldn\'t handle roomstate update.', err);
    }
};

var completableEmotes = function() {
    var completableEmotesList = [];

    bttv.chat.emotes().forEach(function(emote) {
        if (!emote.text) return;

        completableEmotesList.push(emote.text);
    });

    try {
        var usableEmotes = tmi().tmiSession._emotesParser.emoticonRegexToIds;

        for (var emote in usableEmotes) {
            if (!Object.hasOwnProperty.call(usableEmotes, emote)) continue;

            if (usableEmotes[emote].isRegex === true) continue;

            completableEmotesList.push(emote);
        }
    } catch (e) {
        debug.log('Couldn\'t grab user emotes for tab completion.', e);
    }

    return completableEmotesList.sort();
};

var suggestions = exports.suggestions = function(words, index) {
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $suggestions = $chatInterface.find('.suggestions');
    if ($suggestions.length) $suggestions.remove();

    var input = $chatInput.val();
    if (
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

        if (!isEmote) {
            if (!detectServerCommand(input) && lastWord.charAt(0) === '@') {
                sentence.push('@' + lookupDisplayName(user, false));
            } else {
                sentence.push(lookupDisplayName(user, false));
            }
        } else {
            sentence.push(user);
        }

        if (sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ', ');
        } else {
            $chatInput.val(sentence.join(' ') + ' ');
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

exports.tabCompletion = function(e) {
    var keyCode = e.keyCode || e.which;
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');

    var input = $chatInput.val();
    var sentence = input.trim().split(' ');
    var lastWord = sentence.pop().replace(/,$/, '');

    // If word is an emote, casing is important
    var emotes = completableEmotes();
    if (emotes.indexOf(lastWord) === -1) {
        lastWord = lastWord.toLowerCase();
    }

    if ((detectServerCommand(input) || keyCode === keyCodes.Tab || lastWord.charAt(0) === '@') && keyCode !== keyCodes.Enter) {
        var sugStore = store.suggestions;

        var currentMatch = lastWord.replace(/^@/, '');
        var currentIndex = sugStore.matchList.indexOf(currentMatch);

        var user;

        if (currentMatch === sugStore.lastMatch && currentIndex > -1) {
            var nextIndex;
            var prevIndex;

            if (currentIndex + 1 < sugStore.matchList.length) {
                nextIndex = currentIndex + 1;
            } else {
                nextIndex = sugStore.matchList.length - 1;
            }

            if (currentIndex - 1 >= 0) {
                prevIndex = currentIndex - 1;
            } else {
                prevIndex = 0;
            }

            var index = e.shiftKey ? prevIndex : nextIndex;

            user = sugStore.matchList[index];

            if (sugStore.matchList.length < 6) {
                suggestions(sugStore.matchList, index);
            } else {
                var slice;

                if (index - 2 < 0) {
                    slice = 0;
                } else if (index + 2 > sugStore.matchList.length - 1) {
                    slice = sugStore.matchList.length - 5;
                    index = (index === sugStore.matchList.length - 1) ? 4 : 3;
                } else {
                    slice = index - 2;
                    index = 2;
                }

                suggestions(sugStore.matchList.slice(slice, slice + 5), index);
            }
        } else {
            var search = currentMatch;
            var users = Object.keys(store.chatters);

            var recentWhispers = [];

            if (detectServerCommand(input)) {
                for (var i = users.length; i >= 0; i--) {
                    if (store.chatters[users[i]] !== undefined && store.chatters[users[i]].lastWhisper !== 0) {
                        recentWhispers.push(users[i]);
                        users.splice(i, 1);
                    }
                }

                recentWhispers.sort(function(a, b) {
                    return store.chatters[b].lastWhisper - store.chatters[a].lastWhisper;
                });
            }

            users.sort();
            users = recentWhispers.concat(users);

            // Mix in emotes if not directly asking for a user
            if (lastWord.charAt(0) !== '@' && !detectServerCommand(input)) {
                users = bttv.settings.get('tabCompletionEmotePriority') ? emotes.concat(users) : users.concat(emotes);
            }

            if (users.indexOf(vars.userData.name) > -1) users.splice(users.indexOf(vars.userData.name), 1);

            if (/^(\/|\.)/.test(search)) {
                search = '';
            }

            if (search.length) {
                users = users.filter(function(userToFilter) {
                    var lcUser = userToFilter.toLowerCase();
                    return (lcUser.indexOf(search) === 0);
                });
            }

            if (!users.length) return;

            sugStore.matchList = users;

            suggestions(users.slice(0, 5), 0);

            user = users[0];
        }

        var $suggestions = $chatInterface.find('.suggestions');
        setTimeout(function() {
            $suggestions.remove();
        }, 10000);

        if (keyCode !== keyCodes.Tab) return;

        sugStore.lastMatch = user;

        // Casing is important for emotes
        var isEmote = true;
        if (emotes.indexOf(user) === -1) {
            user = lookupDisplayName(user, false);
            isEmote = false;
        }

        if (/^(\/|\.)/.test(lastWord) && sentence.length === 0) {
            user = lastWord + ' ' + user;
            $chatInput.val(user);
            return;
        }

        if (lastWord.charAt(0) === '@' && !isEmote && !detectServerCommand(input)) {
            user = '@' + user;
        }

        sentence.push(user);

        if (sentence.length === 1 && !isEmote) {
            $chatInput.val(sentence.join(' ') + ', ');
        } else {
            $chatInput.val(sentence.join(' '));
        }
    }
};

var serverMessage = exports.serverMessage = function(message, displayTimestamp) {
    var handlers = require('./handlers');
    handlers.onPrivmsg(store.currentRoom, {
        from: 'jtv',
        date: displayTimestamp ? new Date() : null,
        message: message,
        style: 'admin'
    });
};

exports.whisperReply = function() {
    var $chatInput = $('.ember-chat .chat-interface').find('textarea');
    if ($chatInput.val() === '/r ' && bttv.settings.get('disableWhispers') === false) {
        var to = $('.chat-line.whisper:last .from:first').text();
        if (to) {
            $chatInput.val('/w ' + to + ' ');
        } else {
            $chatInput.val('');
            serverMessage('You have not received any whispers', true);
        }
    }
};
exports.chatLineHistory = function($chatInput, e) {
    if (bttv.settings.get('chatLineHistory') === false) return;

    var keyCode = e.keyCode || e.which;

    var historyIndex = store.chatHistory.indexOf($chatInput.val().trim());
    if (keyCode === keyCodes.UpArrow) {
        if (historyIndex >= 0) {
            if (store.chatHistory[historyIndex + 1]) {
                $chatInput.val(store.chatHistory[historyIndex + 1]);
            }
        } else {
            if ($chatInput.val().trim().length) {
                store.chatHistory.unshift($chatInput.val().trim());
                $chatInput.val(store.chatHistory[1]);
            } else {
                $chatInput.val(store.chatHistory[0]);
            }
        }
    } else if (keyCode === keyCodes.DownArrow) {
        if (historyIndex >= 0) {
            if (store.chatHistory[historyIndex - 1]) {
                $chatInput.val(store.chatHistory[historyIndex - 1]);
            } else {
                $chatInput.val('');
            }
        }
    }
};

exports.notifyMessage = function(type, message) {
    var handlers = require('./handlers');
    var tagType = (bttv.settings.get('showJTVTags') === true && ['moderator', 'broadcaster', 'admin', 'global-moderator', 'staff', 'bot'].indexOf(type) !== -1) ? 'old' + type : type;
    handlers.onPrivmsg(store.currentRoom, {
        from: 'twitchnotify',
        date: new Date(),
        badges: [{
            type: tagType === 'subscriber' ? 'twitch-' + tagType + '-0' : tagType,
            name: ((bttv.settings.get('showJTVTags') && type !== 'subscriber' && type !== 'turbo') ? type.capitalize() : ''),
            description: tagType.capitalize()
        }],
        message: message,
        style: 'notification'
    });
};

var replaceEmojiCodesWithEmoji = function(message) {
    return message.split(' ').map(function(piece) {
        if (piece.charAt(0) !== ':' || piece.charAt(piece.length - 1) !== ':') return piece;
        var emoji = emojilib.ordered[emojilib.ordered.indexOf(piece.replace(/:/g, ''))];
        if (!emoji || !emojilib.lib[emoji]) return piece;
        if (!store.bttvEmotes[piece] || store.bttvEmotes[piece].type !== 'emoji') return piece;
        return emojilib.lib[emoji].char;
    }).join(' ');
};

exports.sendMessage = function(message) {
    if (!message || message === '') return;
    if (tmi()) {
        if (!vars.userData.isLoggedIn) {
            try {
                window.Ember.$.login();
            } catch (e) {
                serverMessage('You must be logged into Twitch to send messages.');
            }
            return;
        }

        if (['/', '.'].indexOf(message.charAt(0)) > -1) {
            message = message.split(' ');
            message[0] = message[0].toLowerCase();
            message = message.join(' ');
        }

        // Replace all emoji codes with unicode
        message = replaceEmojiCodesWithEmoji(message);

        // Fixes issues with Twitch's text suggestions (bits, emotes, etc.)
        tmi().set('messageToSend', '');
        tmi().set('savedInput', '');

        if (tmi().tmiSession.sendWhisper && ['/w', '.w'].indexOf(message.substr(0, 2)) > -1) {
            tmi().send(message);
            return;
        }

        if (containsCheer(message)) {
            var service = App && App.__container__.lookup('service:bits');
            if (tmi().channel && service) {
                service.sendBits(tmi().channel._id, message).then(function() {}, function(e) {
                    if (e.status === 401) {
                        var room = App.__container__.lookup('controller:room');
                        room.send('handleNotLoggedIn', {
                            mpSourceAction: 'chat-bits',
                            params: {sudo_reason: 'bits'}
                        });
                    } else {
                        serverMessage(e.responseJSON.message);
                    }
                });
            }
            return;
        }

        if (message.substr(0, 6) === '/unpin') {
            $('.pinned-cheers__dismiss').click();
            return;
        }

        if (bttv.chat.store.isAnonMode === true && message !== '/join') {
            serverMessage('You can\'t send messages when Anon Chat is enabled. You can disable Anon Chat in the BetterTTV settings.');
            return;
        }

        tmi().tmiRoom.sendMessage(message);

        try {
            if (!/^\/w(\s|$)/.test(message)) {
                if (['/', '.'].indexOf(message.charAt(0)) === -1) {
                    channelState({
                        type: 'outgoing_message'
                    });
                }
                bttv.ws.broadcastMe();
                tmi().trackSubOnly(message);
                tmi().trackChat();
            }
        } catch (e) {
            debug.log('Error sending tracking data to Twitch');
        }
    }
};

exports.reparseMessages = function(user) {
    if (!user || !user.length) return;

    bttv.jQuery('.chat-line[data-sender="' + user + '"] .message').each(function() {
        var message = $(this);

        if (message.hasClass('timed-out')) return;

        var rawMessage = decodeURIComponent(message.data('raw'));
        var emotes = message.data('emotes') ? JSON.parse(decodeURIComponent(message.data('emotes'))) : false;
        var bits = message.data('bits') ? JSON.parse(decodeURIComponent(message.data('bits'))) : false;
        var color = message.attr('style') ? message.attr('style').split(': ')[1] : false;

        message.replaceWith(templates.message(user, rawMessage, {emotes: emotes, colored: color, bits: bits}));
    });
};

exports.isIgnored = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiSession.isIgnored(user);
};

var getBTTVBadges = exports.getBTTVBadges = function(user, isMod) {
    var badges = {};
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf(bttv.getChannel()) !== -1) badges.subscriber = '1';
    if ((store.__channelBots.indexOf(user) > -1 || bots.indexOf(user) > -1) && isMod) badges.bot = '1';
    return badges;
};

var getBadges = exports.getBadges = function(user) {
    var badges = {};
    if (!user || user === '') return badges;
    if (tmi() && tmi().tmiRoom.getBadges(user)) badges = tmi().tmiRoom.getBadges(user);
    return Object.assign(getBTTVBadges(user, badges.hasOwnProperty('moderator')), badges);
};

var isOwner = exports.isOwner = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('broadcaster');
};

var isAdmin = exports.isAdmin = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('admin');
};

var isGlobalMod = exports.isGlobalMod = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('global_mod');
};

var isStaff = exports.isStaff = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('staff');
};

var isModerator = exports.isModerator = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('moderator') || isAdmin(user) || isStaff(user) || isOwner(user) || isGlobalMod(user);
};

exports.isTurbo = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('turbo');
};

exports.isSubscriber = function(user) {
    if (!user || user === '') return false;
    return getBadges(user).hasOwnProperty('subscriber');
};

exports.hasGlow = function(user) {
    if (!user || user === '') return false;
    if (store.__subscriptions[user] && store.__subscriptions[user].indexOf('_glow') !== -1) return true;
};

exports.getColor = function(user) {
    if (!user || user === '') return false;
    return tmi() ? tmi().tmiSession.getColor(user) : null;
};

exports.getEmotes = function(user) {
    if (!user || user === '') return false;
    var emotes = [];
    if (tmi() && tmi().tmiRoom.getEmotes && tmi().tmiRoom.getEmotes(user)) emotes = tmi().tmiRoom.getEmotes(user);
    if (store.__subscriptions[user]) {
        store.__subscriptions[user].forEach(function(channel) {
            emotes.push(channel);
        });
    }
    return emotes;
};

exports.scrollChat = throttle(function() {
    var $chat = $('.ember-chat');

    var chatPaused = $chat.find('.chat-interface .more-messages-indicator').length;

    if (chatPaused || chatFreeze() || !$chat.length) return;

    var $chatMessages = $chat.find('.chat-messages');
    var $chatScroller = $chatMessages.children('.tse-scroll-content');
    var $chatLines = $chatScroller.find('.chat-lines').children('div.chat-line');

    setTimeout(function() {
        if (!$chatScroller.length) return;

        $chatScroller[0].scrollTop = $chatScroller[0].scrollHeight;
    });

    var linesToDelete = $chatLines.length - bttv.settings.get('scrollbackAmount');

    if (linesToDelete <= 1) return;

    if (linesToDelete % 2) {
        linesToDelete--;
    }

    $chatLines.slice(0, linesToDelete).each(function() {
        $(this).remove();
    });
}, 250);

exports.calculateColor = function(color) {
    var colorRegex = /^#[0-9a-f]+$/i;
    if (colorRegex.test(color)) {
        while (((calculateColorBackground(color) === 'light' && bttv.settings.get('darkenedMode') === true) || (calculateColorBackground(color) === 'dark' && bttv.settings.get('darkenedMode') !== true))) {
            color = calculateColorReplacement(color, calculateColorBackground(color));
        }
    }

    return color;
};
var surrogateOffset = function(surrogates, index) {
    var offset = index;

    for (var id in surrogates) {
        if (!Object.hasOwnProperty.call(surrogates, id)) continue;
        if (id < index) offset++;
    }

    return offset;
};

exports.handleSurrogatePairs = function(message, emotes) {
    // Entire message decoded to array of char codes, combines
    // surrogate pairs to a single index
    var decoded = punycode.ucs2.decode(message);

    var surrogates = {};
    var i;
    for (i = 0; i < decoded.length; i++) {
        // Not surrogate
        if (decoded[i] <= 0xFFFF) continue;

        surrogates[i] = true;
    }

    // We can loop through all emote ids and all indexes that id
    // appears in the message, offsetting the indexes +1 for each
    // surrogate pair occurring before the index
    for (var id in emotes) {
        if (!Object.hasOwnProperty.call(emotes, id)) continue;

        var emote = emotes[id];
        for (i = emote.length - 1; i >= 0; i--) {
            for (var j = 0; j < emote[i].length; j++) {
                emote[i][j] = surrogateOffset(surrogates, emote[i][j]);
            }
        }
    }

    return emotes;
};

exports.loadBTTVBadges = function() {
    if ($('#bttv_volunteer_badges').length) return;

    $.getJSON('https://api.betterttv.net/2/badges').done(function(data) {
        var $style = $('<style />');

        $style.attr('id', 'bttv_volunteer_badges');

        data.types.forEach(function(badge) {
            $style.append('.badges .bttv-' + badge.name + ' { background: url("' + badge.svg + '"); background-size: 100%; }');
            store.__bttvBadgeTypes[badge.name] = badge;
        });

        $style.appendTo('head');

        data.badges.forEach(function(user) {
            store.__bttvBadges[user.name] = user.type;
        });
    });
};

exports.loadTwitchBadges = function() {
    if ($('#twitch_badges').length) return;

    $.getJSON('https://badges.twitch.tv/v1/badges/global/display').done(function(data) {
        if (!data || !data.badge_sets) {
            debug.log('Failed to load Twitch badges');
            return;
        }

        var $style = $('<style />');
        $style.attr('id', 'twitch_badges');

        var quality = window.devicePixelRatio > 1 ? 'image_url_2x' : 'image_url_1x';
        var ignoredBadges = ['admin', 'broadcaster', 'global_mod', 'moderator', 'staff', 'subscriber', 'turbo'];

        Object.keys(data.badge_sets).forEach(function(badge) {
            if (ignoredBadges.indexOf(badge) >= 0) return;

            var badgeData = data.badge_sets[badge];
            Object.keys(badgeData.versions).forEach(function(version) {
                var versionData = badgeData.versions[version];
                var cssLine = '.badges .twitch-' + badge + '-' + version + ' { ';
                if (versionData.click_action !== 'none') cssLine += 'cursor: pointer; ';
                cssLine += 'background: url("' + versionData[quality] + '"); }';
                $style.append(cssLine);
            });

            store.__twitchBadgeTypes[badge] = badgeData;
        });

        $style.appendTo('head');
    });
};

exports.loadSubBadges = function() {
    var tmiChannel = tmi().channel;
    if (!tmiChannel || tmiChannel.partner !== true) return;
    $('#subscriber_badges').remove();

    $.getJSON('https://badges.twitch.tv/v1/badges/channels/' + tmiChannel._id + '/display', function(badges) {
        if (!badges || !badges.badge_sets || !badges.badge_sets.subscriber) {
            debug.log('Failed to load Subscribers badges for ' + tmiChannel.id);
            return;
        }
        var $style = $('<style />');
        $style.attr('id', 'subscriber_badges');
        var quality = window.devicePixelRatio > 1 ? 'image_url_2x' : 'image_url_1x';
        Object.keys(badges.badge_sets.subscriber.versions).forEach(function(version) {
            var subBadge = badges.badge_sets.subscriber.versions[version];
            var cssLine = '.badges .badge.twitch-subscriber-' + version + ' { cursor: pointer; ';
            cssLine += 'background-image: url("' + subBadge[quality] + '"); }';
            $style.append(cssLine);
        });
        store.__subBadgeTypes = badges.badge_sets.subscriber;
        $style.appendTo('head');
    });
};

exports.assignBadges = function(badges, data) {
    data = data || {};
    var bttvBadges = [];
    var legacyTags = require('../legacy-tags')(data);
    var hasBTTVBadge = false;

    Object.assign(badges, getBTTVBadges(data.from, badges.hasOwnProperty('moderator')));

    // Legacy Swag Tags
    if (
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
        if (userData.color && data.style !== 'action') data.color = userData.color;
        if (userData.nickname) data.bttvDisplayName = userData.nickname;

        bttvBadges.unshift({
            type: userData.tagType,
            name: userData.tagName,
            description: 'Grandfathered BetterTTV Swag Tag'
        });

        hasBTTVBadge = true;
    }

    if (badges.hasOwnProperty('staff')) {
        bttvBadges.push({
            type: 'staff',
            name: 'Staff',
            description: 'Twitch Staff'
        });
    } else if (badges.hasOwnProperty('admin')) {
        bttvBadges.push({
            type: 'admin',
            name: 'Admin',
            description: 'Twitch Admin'
        });
    } else if (badges.hasOwnProperty('global_mod')) {
        bttvBadges.push({
            type: 'global-moderator',
            name: 'GMod',
            description: 'Twitch Global Moderator'
        });
    }

    if (badges.hasOwnProperty('bot')) {
        bttvBadges.push({
            type: 'bot',
            name: 'Bot',
            description: 'Channel Bot'
        });
    } else if (badges.hasOwnProperty('broadcaster') && !hasBTTVBadge) {
        bttvBadges.push({
            type: 'broadcaster',
            name: 'Host',
            description: 'Channel Broadcaster'
        });
    } else if (badges.hasOwnProperty('moderator') && !hasBTTVBadge) {
        bttvBadges.push({
            type: 'moderator',
            name: 'Mod',
            description: 'Channel Moderator'
        });
    }

    if (badges.hasOwnProperty('subscriber')) {
        var subBadge = {
            type: 'subscriber twitch-subscriber-' + badges.subscriber,
            name: '',
            clickAction: 'subscribe_to_channel',
            description: 'Channel Subscriber'
        };

        if (store.__subBadgeTypes !== null) {
            var subData = store.__subBadgeTypes.versions[badges.subscriber];
            if (subData !== undefined) {
                subBadge.clickAction = subData.click_action;
                subBadge.description = subData.title;
            }
        }

        bttvBadges.push(subBadge);
    }

    if (badges.hasOwnProperty('turbo')) {
        bttvBadges.push({
            type: 'turbo',
            name: '',
            clickAction: 'turbo',
            description: 'Twitch Turbo'
        });
    }

    Object.keys(store.__twitchBadgeTypes).forEach(function(badge) {
        if (badge === 'bits' && bttv.settings.get('hideBits') === true) return;
        if (badges.hasOwnProperty(badge)) {
            var version = badges[badge];
            var badgeData = store.__twitchBadgeTypes[badge].versions;
            bttvBadges.push({
                type: 'twitch-' + badge + '-' + version,
                name: '',
                clickAction: badgeData[version].click_action,
                description: badgeData[version].title
            });
        }
    });

    // Volunteer badges
    if (data.from in store.__bttvBadges) {
        var type = store.__bttvBadges[data.from];
        bttvBadges.push({
            type: 'bttv-' + type,
            name: '',
            description: store.__bttvBadgeTypes[type].description
        });
    }

    bttvBadges.forEach(function(badge) {
        if (
            bttv.settings.get('showJTVTags') === false &&
            badge.description !== 'Grandfathered BetterTTV Swag Tag'
        ) {
            badge.name = '';
            return;
        }

        if ([
            'moderator',
            'broadcaster',
            'admin',
            'global-moderator',
            'staff',
            'bot'
        ].indexOf(badge.type) === -1) {
            return;
        }

        badge.type = 'old' + badge.type;
    });

    return bttvBadges;
};

exports.ban = function(user, reason) {
    if (!user || user === '') return false;
    var msg = reason ? user + ' ' + reason : user;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.banUser(msg) : null;
};

exports.timeout = function(user, time, reason) {
    if (!user || user === '') return false;
    var msg = user + ' ' + (time || 600);
    if (reason) msg = msg + ' ' + reason;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.timeoutUser(msg) : null;
};

var unban = exports.unban = function(user) {
    if (!user || user === '') return false;
    return tmi() && tmi().tmiRoom ? tmi().tmiRoom.unbanUser(user) : null;
};

exports.massUnban = function() {
    if (!vars.userData.isLoggedIn || vars.userData.name !== bttv.getChannel()) {
        serverMessage("You're not the channel owner.");
        return;
    }

    var unbanCount = 0;

    var unbanChatters = function(users, callback) {
        var interval = setInterval(function() {
            var user = users.shift();

            if (!user) {
                clearInterval(interval);
                callback();
                return;
            }

            unban(user);
        }, 333);
    };

    var getBannedChatters = function() {
        serverMessage('Fetching banned users...');

        $.get('/settings/channel').success(function(data) {
            var $chatterList = $(data).find('#banned_chatter_list');

            if (!$chatterList.length) return serverMessage('Error fetching banned users list.');

            var users = [];

            $chatterList.find('.ban .obj').each(function() {
                var user = $(this).text().trim();
                if (users.indexOf(user) === -1) users.push(user);
            });

            if (users.length === 0) {
                serverMessage('You have no more banned users. Total Unbanned Users: ' + unbanCount);
                return;
            }

            unbanCount += users.length;

            serverMessage('Starting purge process in 5 seconds.');
            serverMessage('This block of users will take ' + (users.length / 3).toFixed(1) + ' seconds to unban.');

            if (users.length > 70) serverMessage('Twitch only provides up to 100 users at a time (some repeat), but this script will cycle through all of the blocks of users.');

            setTimeout(function() {
                unbanChatters(users, function() {
                    serverMessage('This block of users has been purged. Checking for more..');
                    getBannedChatters();
                });
            }, 5000);
        });
    };

    getBannedChatters();
};

exports.translate = function($element, sender, text) {
    var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en';

    var qs = $.param({
        target: language,
        q: text
    });

    $.getJSON('https://api.betterttv.net/2/translate?' + qs).success(function(data) {
        var $newElement = $(templates.message(sender, data.translation));
        $element.replaceWith($newElement);

        // Show original message on hover
        $newElement.on('mouseover', function() {
            $(this).tipsy({
                trigger: 'manual',
                title: function() { return 'Original message: ' + text; }
            }).tipsy('show');
        }).on('mouseout', function() {
            $(this).tipsy('hide');
            $('div.tipsy').remove();
        });
    }).error(function(data) {
        $newElement = $(templates.message(sender, text));
        $element.replaceWith($newElement);

        var error = 'There was an unknown error translating this message.';

        if (data.responseJSON && data.responseJSON.message) {
            error = data.responseJSON.message;
        }

        $newElement.tipsy({
            trigger: 'manual',
            gravity: $.fn.tipsy.autoNS,
            title: function() { return error; }
        });
        $newElement.tipsy('show');
        setTimeout(function() {
            try {
                $newElement.tipsy('hide');
            } catch (e) {}
        }, 3000);
    });
};

exports.followDate = function(user, channel) {
    bttv.TwitchAPI.get('users/' + user + '/follows/channels/' + channel).done(function(data) {
        var m = moment(data.created_at);
        var reply = user + ' followed ' + channel + ' ' + m.fromNow();
        reply = reply + ' (' + m.format('LLL') + ')';
        serverMessage(reply, true);
    }).fail(function(data) {
        serverMessage(data.responseJSON.message, true);
    });
};

exports.loadBTTVChannelData = function() {
    // When swapping channels, removes old channel emotes
    var bttvEmoteKeys = Object.keys(store.bttvEmotes);
    for (var i = bttvEmoteKeys.length - 1; i >= 0; i--) {
        var bttvEmoteKey = bttvEmoteKeys[i];
        if (store.bttvEmotes[bttvEmoteKey].type !== 'channel') continue;
        delete store.bttvEmotes[bttvEmoteKey];
    }

    store.__channelBots = [];

    $.getJSON('https://api.betterttv.net/2/channels/' + bttv.getChannel()).done(function(data) {
        data.emotes.forEach(function(bttvEmote) {
            bttvEmote.type = 'channel';
            bttvEmote.urlTemplate = data.urlTemplate.replace('{{id}}', bttvEmote.id);
            bttvEmote.url = bttvEmote.urlTemplate.replace('{{image}}', '1x');
            store.bttvEmotes[bttvEmote.code] = bttvEmote;
        });
        store.__channelBots = data.bots;
    });
};
