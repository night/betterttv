var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes');
var store = require('./store'),
    handlers = require('./handlers'),
    helpers = require('./helpers'),
    rooms = require('./rooms');
var overrideEmotes = require('../features/override-emotes'),
    loadChatSettings = require('../features/chat-load-settings'),
    cssLoader = require('../features/css-loader'),
    anonChat = require('../features/anon-chat'),
    channelState = require('../features/channel-state');

var takeover = module.exports = function() {
    var tmi = require('./tmi')();

    // Anonymize Chat if it isn't already
    anonChat();

    //add channel state info
    channelState();

    if(store.isLoaded) return;

    // Hides Group List if coming from directory
    bttv.getChatController().set("showList", false);

    if(tmi.get('isLoading')) {
        debug.log('chat is still loading');
        setTimeout(function() {
            takeover();
        }, 1000);
        return;
    }

    // Default timestamps & mod icons to on
    var settings = bttv.storage.getObject('chatSettings');
    if(typeof settings.showModIcons === "undefined") {
        settings.showModIcons = true;
        $('.ember-chat .chat-messages').removeClass('hideModIcons');
        bttv.storage.putObject('chatSettings', settings);
    }
    if(typeof settings.showTimestamps === "undefined") {
        settings.showTimestamps = true;
        $('.ember-chat .chat-messages').removeClass('hideTimestamps');
        bttv.storage.putObject('chatSettings', settings);
    }
    if(settings.darkMode === true) {
        settings.darkMode = false;
        $('.chat-container').removeClass('dark');
        bttv.storage.putObject('chatSettings', settings);
        bttv.settings.save('darkenedMode', true);
    }

    store.isLoaded = true;

    // Take over listeners
    debug.log('Loading chat listeners');
    for(var channel in tmi.tmiSession._rooms) {
        if(tmi.tmiSession._rooms.hasOwnProperty(channel)) {
            delete tmi.tmiSession._rooms[channel]._events['message'];
            delete tmi.tmiSession._rooms[channel]._events['clearchat'];
            delete tmi.tmiSession._rooms[channel]._events['notice'];
        }
    }

    // Handle Channel Chat
    rooms.newRoom(bttv.getChannel());
    tmi.tmiRoom.on('message', rooms.getRoom(bttv.getChannel()).chatHandler);
    tmi.tmiRoom.on('clearchat', handlers.clearChat);
    tmi.tmiRoom.on('notice', handlers.notice);
    if(tmi.channel) tmi.set('name', tmi.channel.get('display_name'));
    store.currentRoom = bttv.getChannel();
    //tmi.tmiRoom.on('labelschanged', handlers.labelsChanged);

    // Handle Group Chats
    var privateRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    if(privateRooms && privateRooms.length > 0) {
        privateRooms.forEach(function(room) {
            rooms.newRoom(room.get('id'));
            room.tmiRoom.on('message', rooms.getRoom(room.get('id')).chatHandler);
            room.tmiRoom.on('clearchat', handlers.clearChat);
        });
    }

    // Load BTTV emotes if not loaded
    overrideEmotes();

    var bttvEmoteKeys = Object.keys(store.bttvEmotes);
    for(var i=bttvEmoteKeys.length-1; i>=0; i--) {
        var emote = bttvEmoteKeys[i];
        if(store.bttvEmotes[emote].id.toString().charAt(0) !== 'c') continue;
        delete store.bttvEmotes[emote];
    }
    store.__channelBots = [];
    $.getJSON("https://api.betterttv.net/2/channels/"+bttv.getChannel()).done(function(data) {
        data.emotes.forEach(function(emote) {
            emote.channelEmote = true;
            emote.urlTemplate = data.urlTemplate.replace('{{id}}', emote.id);
            emote.url = emote.urlTemplate.replace('{{image}}', '1x');
            store.bttvEmotes[emote.code] = emote;
        });
        store.__channelBots = data.bots;
    });

    // Load Volunteer Badges
    helpers.loadBadges();

    // Load Chat Settings
    loadChatSettings();

    // Hover over links
    $("body").off('mouseover', '.chat-line .message a').on('mouseover', '.chat-line .message a', function() {
        var $this = $(this);

        var encodedURL = encodeURIComponent($this.attr('href'));
        $.getJSON("https://api.betterttv.net/2/link_resolver/" + encodedURL).done(function(data) {
            if(!data.tooltip || !$this.is(':hover')) return;

            $this.tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return data.tooltip; }
            });
            $this.tipsy("show");
        });
    }).off('mouseout', '.chat-line .message a').on('mouseout', '.chat-line .message a', function() {
        $(this).tipsy("hide");
        $('div.tipsy').remove();
    });

    // Hover over icons
    $("body").off('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: "sw"
        });
        $(this).tipsy("show");
    }).off('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy("hide");
        $('div.tipsy').remove();
    });

    // hover over mod card icons
    $("body").off('mouseover', '.bttv-mod-card button').on('mouseover', '.bttv-mod-card button', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: "s"
        });
        $(this).tipsy("show");
    }).off('mouseout', '.bttv-mod-card button').on('mouseout', '.bttv-mod-card button', function() {
        $(this).tipsy("hide");
        $('div.tipsy').remove();
    });

    // Make Timeout/Ban/Unban buttons work and Turbo/Subscriber clickable
    $("body").off("click", ".chat-line .mod-icons .timeout").on("click", ".chat-line .mod-icons .timeout", function() {
        helpers.timeout($(this).parents(".chat-line").data("sender"));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off("click", ".chat-line .mod-icons .ban").on("click", ".chat-line .mod-icons .ban", function() {
        helpers.ban($(this).parents(".chat-line").data("sender"));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off("click", ".chat-line .mod-icons .unban").on("click", ".chat-line .mod-icons .unban", function() {
        helpers.unban($(this).parents(".chat-line").data("sender"));
        $(this).parent().children('.ban').show();
        $(this).parent().children('.unban').hide();
    }).off("click", ".chat-line .badges .turbo, .chat-line .badges .subscriber").on("click", ".chat-line .badges .turbo, .chat-line .badges .subscriber", function() {
        if($(this).hasClass('turbo')) {
            window.open('/products/turbo?ref=chat_badge','_blank');
        } else if($(this).hasClass('subscriber')) {
            window.open(Twitch.url.subscribe(bttv.getChannel(),'in_chat_subscriber_link'),'_blank');
        }
    });

    // Make names clickable
    $("body").off("click", ".chat-line .from").on("click", ".chat-line .from", function() {
        var sender = $(this).data('sender') || $(this).parent().data('sender');
        handlers.moderationCard(sender + "", $(this));
    });

    // Give some tips to Twitch Emotes
    if(bttv.TwitchEmoteSets && tmi.product && tmi.product.emoticons) {
        for(var i=0; i<tmi.product.emoticons.length; i++) {
            var emote = tmi.product.emoticons[i];

            if(emote.state && emote.state === "active" && !bttv.TwitchEmoteSets[emote.emoticon_set]) {
                bttv.io.giveEmoteTip(bttv.getChannel());
                break;
            }
        }
    }

    // Make chat translatable
    if (!vars.loadedDoubleClickTranslation && bttv.settings.get("dblclickTranslation") !== false) {
        vars.loadedDoubleClickTranslation = true;
        $('body').on('dblclick', '.chat-line', function() {
            helpers.translate($(this).find('.message'), $(this).data("sender"), $(this).find('.message').data("raw"));
            $(this).find('.message').text("Translating..");
            $('div.tipsy').remove();
        });
    }

    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $chatSend = $chatInterface.find('.send-chat-button');

    // Disable Twitch's chat senders
    $chatInput.off();
    $chatSend.off();

    // Message input features (tab completion, message history)
    $chatInput.on('keyup', function(e) {
        // '@' completion is captured only on keyup
        if(e.which === keyCodes.Tab || e.which === keyCodes.Shift) return;
        helpers.tabCompletion(e);
        helpers.whisperReply(e);
    });

    // Implement our own text senders (+ commands & legacy tab completion)
    $chatInput.on('keydown', function(e) {
        if(e.which === keyCodes.Enter) {
            var val = $chatInput.val().trim(),
                bttvCommand = false;
            if(e.shiftKey || !val.length) {
                return e.preventDefault();
            }

            var $suggestions = $chatInterface.find('.suggestions');
            if ($suggestions.length){
                $suggestions.find('.highlighted').children().click();
                return e.preventDefault();
            }

            if(val.charAt(0) === '/') {
                bttvCommand = handlers.commands(val);
            }

            // Easter Egg Kappa
            var words = val.toLowerCase().split(' ');
            if(words.indexOf('twitch') > -1 && words.indexOf('amazon') > -1 && words.indexOf('google') > -1) {
                helpers.serverMessage('<img src="https://cdn.betterttv.net/special/twitchtrollsgoogle.gif"/>');
            }

            if(!bttvCommand) {
                helpers.sendMessage(val);
            }

            if(bttv.settings.get('chatLineHistory') === true) {
                if(store.chatHistory.indexOf(val) !== -1) {
                    store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
                }
                store.chatHistory.unshift(val);
            }

            $chatInput.val('');
            return e.preventDefault();
        }

        var $suggestions = $chatInterface.find('.suggestions');
        if($suggestions.length && e.which !== keyCodes.Shift) {
            $suggestions.remove();
        }

        // Actual tabs must be captured on keydown
        if((e.which === keyCodes.Tab && !e.ctrlKey) || /^(\/|.)w $/.test(val)) {
            helpers.tabCompletion(e);
            e.preventDefault();
        }

        helpers.chatLineHistory($chatInput, e);
    });
    $chatSend.on('click', function() {
        var val = $chatInput.val().trim(),
            bttvCommand = false;
        if(!val.length) return;

        if(val.charAt(0) === '/') {
            bttvCommand = handlers.commands(val);
        }

        if(!bttvCommand) {
            helpers.sendMessage(val);
        }

        if(bttv.settings.get('chatLineHistory') === true) {
            if(store.chatHistory.indexOf(val) !== -1) {
                store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
            }
            store.chatHistory.unshift(val);
        }

        $chatInput.val('');
    });

    $('.ember-chat .chat-messages .chat-line').remove();
    bttv.io.chatHistory(function(history) {
        if(history.length) {
            history.forEach(function(message) {
                var badges = [];
                if(message.user.name === message.channel.name) badges.push("owner");

                if(bttv.chat.helpers.isIgnored(message.user.name)) return;

                message = bttv.chat.templates.privmsg(false, false, false, false, {
                    message: message.message,
                    time: (new Date(message.date.replace("T", " ").replace(/\.[0-9]+Z/, " GMT"))).toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, "$1:$2"),
                    nickname: message.user.name,
                    sender: message.user.name,
                    badges: bttv.chat.helpers.assignBadges(badges),
                    color: bttv.chat.helpers.calculateColor(message.user.color),
                    emotes: message.parsedEmotes
                });

                $(".ember-chat .chat-messages .tse-content .chat-lines").append(message);
            });
        }

        helpers.serverMessage('<center><small>BetterTTV v' + bttv.info.version + ' Loaded.</small></center>');
        helpers.serverMessage('Welcome to '+helpers.lookupDisplayName(bttv.getChannel())+'\'s chat room!', true);

        bttv.chat.helpers.scrollChat();
    });

    bttv.io.joinChannel();

    // Reset chatters list
    store.chatters = {};
    store.chatters[bttv.getChannel()] = {lastWhisper: 0};

    // When messages come in too fast, things get laggy
    if(!store.__messageTimer) store.__messageTimer = setInterval(handlers.shiftQueue, 500);

    // Active Tab monitoring - Useful for knowing if a user is "watching" chat
    $(window).off("blur focus").on("blur focus", function(e) {
        var prevType = $(this).data("prevType");

        if (prevType != e.type) {   //  reduce double fire issues
            switch (e.type) {
                case "blur":
                    store.activeView = false;
                    break;
                case "focus":
                    $('.chat-interface textarea').focus();
                    store.activeView = true;
                    break;
            }
        }

        $(this).data("prevType", e.type);
    });

    // Keycode to quickly timeout users
    $(window).off("keydown").on("keydown", function(e) {
        var keyCode = e.keyCode || e.which;

        if($('.bttv-mod-card').length && bttv.settings.get("modcardsKeybinds") === true) {
            var user = $('.bttv-mod-card').data('user');
            switch (keyCode) {
                case keyCodes.Esc:
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.t:
                    helpers.timeout(user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.p:
                    helpers.timeout(user, 1);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.a:
                    helpers.sendMessage("!permit "+user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.b:
                    helpers.ban(user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.i:
                    helpers.sendMessage("/ignore "+user);
                    $('.bttv-mod-card').remove();
                    break;
                case keyCodes.w:
                    e.preventDefault();
                    var $chatInput = $('.ember-chat .chat-interface').find('textarea');
                    $chatInput.val('/w ' + user + ' ');
                    $chatInput.focus();
                    $('.bttv-mod-card').remove();
                    break;
            }
        }
    });
    
    $('.tse-content').on('dblclick', '.chat-line .from', function(e) {
        if(bttv.settings.get('dblClickAutoComplete') === false) return;
        var sender = $(this).text();
        if (sender) {
            $('.ember-chat .chat-interface').find('textarea').val(sender + ", ");
        }
    });
}
