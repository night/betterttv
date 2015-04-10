var vars = require('../vars'),
    keyCodes = require('../keycodes');
var tmi = require('./tmi'),
    store = require('./store'),
    templates = require('./templates');

// Helper functions
var removeElement = require('../helpers/element').remove;
var escapeRegExp = require('../helpers/regex').escapeRegExp;
var calculateColorBackground = require('../helpers/colors').calculateColorBackground;
var calculateColorReplacement = require('../helpers/colors').calculateColorReplacement;

var lookupDisplayName = exports.lookupDisplayName = function(user) {
    if(!user || user === "") return;
    var socketServer = bttv.socketServer;
    if(tmi()) {
        if(store.displayNames[user]) {
            if(socketServer && (Date.now()-store.displayNames[user].date) > 900000) {
                socketServer.emit('lookup', { user: user });
            }
            return store.displayNames[user].displayName;
        } else if(user !== "jtv" && user !== "twitchnotify") {
            if(socketServer && store.__usersBeingLookedUp < 3) {
                socketServer.emit('lookup', { user: user });
            }

            store.__usersBeingLookedUp++;

            return user.capitalize();
        } else {
            return user;
        }
    } else {
        return user.capitalize();
    }
};
var tabCompletion = exports.tabCompletion = function(e) {
    var keyCode = e.keyCode || e.which;
    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');

    var sentence = $chatInput.val().trim().split(' ');
    var lastWord = sentence.pop().toLowerCase();

    if(keyCode === keyCodes.Tab || lastWord.charAt(0) === '@' && keyCode !== keyCodes.Enter) {
        var sugStore = store.suggestions;

        var currentMatch = lastWord.replace(/(^@|,$)/g, '');
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

            users = users.sort();

            if(currentMatch.length && search.length) {
                users = users.filter(function(user) {
                    return (user.search(search, "i") === 0);
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

        user = lookupDisplayName(user);

        if(lastWord.charAt(0) === '@') {
            user = '@'+user;
        }

        sentence.push(user);

        if(sentence.length === 1) {
            $chatInput.val(sentence.join(' ') + ", ");
        } else {
            $chatInput.val(sentence.join(' '));
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

    var $suggestions = $chatInterface.find('.textarea-contain').append(templates.suggestions(words, index)).find('.suggestions');
    $suggestions.find('.suggestion').on('click', function() {
        var user = $(this).text();
        var sentence = $chatInput.val().trim().split(' ');
        var lastWord = sentence.pop();
        if (lastWord.charAt(0) === '@') {
        sentence.push("@" + lookupDisplayName(user));
        } else {
            sentence.push(lookupDisplayName(user));
        }
        if(sentence.length === 1) {
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

        tmi().tmiRoom.sendMessage(message);

        // Fixes issue when using Twitch's sub emote selector
        tmi().set('messageToSend', '');
        tmi().set('savedInput', '');
    }
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
    return tmi() && tmi().tmiRoom.getLabels(user).indexOf('mod') !== -1;
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
    return badges;
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
var assignBadges = exports.assignBadges = function(badges, data) {
    data = data || {};
    var bttvBadges = [];

    if(badges && badges.length > 0) {
        if(badges.indexOf('staff') !== -1) {
            bttvBadges.push({
                type: (bttv.settings.get("showJTVTags") === true?'old':'')+'staff',
                name: (bttv.settings.get("showJTVTags") === true?'Staff':''),
                description: 'Twitch Staff'
            });
        } else if(badges.indexOf('admin') !== -1) {
            bttvBadges.push({
                type: (bttv.settings.get("showJTVTags") === true?'old':'')+'admin',
                name: (bttv.settings.get("showJTVTags") === true?'Admin':''),
                description: 'Twitch Admin'
            });
        } else if(badges.indexOf('global_mod') !== -1) {
            bttvBadges.push({
                type: (bttv.settings.get("showJTVTags") === true?'old':'')+'global-moderator',
                name: (bttv.settings.get("showJTVTags") === true?'GMod':''),
                description: 'Twitch Global Moderator'
            });
        } else if(badges.indexOf('owner') !== -1 && !data.bttvTagType) {
            bttvBadges.push({
                type: (bttv.settings.get("showJTVTags") === true?'old':'')+'broadcaster',
                name: (bttv.settings.get("showJTVTags") === true?'Host':''),
                description: 'Channel Broadcaster'
            });
        } else if(badges.indexOf('mod') !== -1 && !data.bttvTagType) {
            bttvBadges.push({
                type: (bttv.settings.get("showJTVTags") === true?'oldmoderator':'moderator'),
                name: (bttv.settings.get("showJTVTags") === true?'Mod':''),
                description: 'Channel Moderator'
            });
        }

        if(data.bttvTagType && data.bttvTagName) {
            bttvBadges.unshift({
                type: data.bttvTagType,
                name: data.bttvTagName,
                description: data.bttvTagDesc?data.bttvTagDesc:data.bttvTagName
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
    }

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
var translate = exports.translate = function(element, sender, text) {
    var language = (window.cookie && window.cookie.get('language')) ? window.cookie.get('language') : 'en',
        query = 'http://translate.google.com/translate_a/t?client=bttv&sl=auto&tl='+language+'&ie=UTF-8&oe=UTF-8&q='+text,
        translate = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D\""+encodeURIComponent(query)+"\"&format=json&diagnostics=false&callback=?";

    $.ajax({
        url: translate,
        cache: !1,
        timeoutLength: 6E3,
        dataType: 'json',
        success: function (data) {
            if(data.error) {
                $(element).text("Translation Error");
            } else {
                var sentences = data.query.results.json.sentences;
                if(sentences instanceof Array) {
                    var translation = "";
                    sentences.forEach(function(sentence) {
                        translation += sentence.trans;
                    });
                } else {
                    var translation = sentences.trans;
                }

                $(element).replaceWith(templates.message(sender, translation));
            }
        },
        error: function() {
            $(element).text("Translation Error: Server Error");
        }
    });
}
