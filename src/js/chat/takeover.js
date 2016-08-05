var vars = require('../vars'),
    debug = require('../helpers/debug'),
    keyCodes = require('../keycodes'),
    store = require('./store'),
    handlers = require('./handlers'),
    helpers = require('./helpers'),
    rooms = require('./rooms'),
    templates = require('./templates'),
    debounce = require('lodash.debounce'),
    loadChatSettings = require('../features/chat-load-settings'),
    anonChat = require('../features/anon-chat'),
    customTimeouts = require('../features/custom-timeouts');

var takeover = module.exports = function() {
    var tmi = require('./tmi')();
    var channel;

    // Anonymize Chat if it isn't already
    anonChat();

    if (bttv.settings.get('disableUsernameColors') === true) {
        $('.ember-chat .chat-room').addClass('no-name-colors');
    } else {
        $('.ember-chat .chat-room').removeClass('no-name-colors');
    }

    if (!$('.ember-chat .chat-header:first').hasClass('main-header')) {
        $('.ember-chat .chat-header:first').addClass('main-header');
    }

    if (store.isLoaded) return;

    // Hides Group List if coming from directory
    bttv.getChatController().set('showList', false);

    if (tmi.get('isLoading')) {
        debug.log('chat is still loading');
        setTimeout(function() {
            takeover();
        }, 1000);
        return;
    }

    // Default timestamps & mod icons to on
    var settings = bttv.storage.getObject('chatSettings');
    if (typeof settings.showModIcons === 'undefined') {
        settings.showModIcons = true;
        $('.ember-chat .chat-messages').removeClass('hideModIcons');
        bttv.storage.putObject('chatSettings', settings);
    }
    if (typeof settings.showTimestamps === 'undefined') {
        settings.showTimestamps = true;
        $('.ember-chat .chat-messages').removeClass('hideTimestamps');
        bttv.storage.putObject('chatSettings', settings);
    }
    if (settings.darkMode === true) {
        settings.darkMode = false;
        $('.chat-container').removeClass('dark');
        bttv.storage.putObject('chatSettings', settings);
        bttv.settings.save('darkenedMode', true);
    }

    store.isLoaded = true;

    // Take over listeners
    debug.log('Loading chat listeners');
    for (channel in tmi.tmiSession._rooms) {
        if (tmi.tmiSession._rooms.hasOwnProperty(channel)) {
            delete tmi.tmiSession._rooms[channel]._events.message;
            delete tmi.tmiSession._rooms[channel]._events.clearchat;
            delete tmi.tmiSession._rooms[channel]._events.notice;
        }
    }

    // Handle Channel Chat
    rooms.newRoom(bttv.getChannel());
    rooms.getRoom(bttv.getChannel()).delay = tmi.roomProperties.chat_delay_duration;
    tmi.tmiRoom.on('message', rooms.getRoom(bttv.getChannel()).chatHandler);
    tmi.tmiRoom.on('clearchat', handlers.clearChat.bind(this, rooms.getRoom(bttv.getChannel())));
    tmi.tmiRoom.on('notice', handlers.notice);
    tmi.tmiRoom.on('roomstate', helpers.parseRoomState);
    if (tmi.channel) tmi.set('name', tmi.channel.get('display_name'));
    store.currentRoom = bttv.getChannel();
    // tmi.tmiRoom.on('labelschanged', handlers.labelsChanged);

    // Takes over whisper replies (actually all messages Twitch still emits)
    tmi.set('addMessage', function(d) {
        handlers.onPrivmsg(bttv.getChannel(), d);
    });

    // Fake the initial roomstate
    helpers.parseRoomState({
        tags: {
            'subs-only': tmi.get('subsOnly'),
            slow: tmi.get('slow'),
            r9k: tmi.get('r9k'),
            'emote-only': tmi.get('emoteOnly')
        }
    });
    vars.localSubsOnly = false;
    vars.localModsOnly = false;

    // Handle Group Chats
    var privateRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    if (privateRooms && privateRooms.length > 0) {
        privateRooms.forEach(function(room) {
            rooms.newRoom(room.get('id'));
            room.tmiRoom.on('message', rooms.getRoom(room.get('id')).chatHandler);
            room.tmiRoom.on('clearchat', handlers.clearChat.bind(this, rooms.getRoom(room.get('id'))));
        });
    }

    // Load Twitch badges
    helpers.loadTwitchBadges();

    // Load BTTV channel emotes/bots
    helpers.loadBTTVChannelData();

    // Load Volunteer Badges
    helpers.loadBTTVBadges();
    bttv.ws.broadcastMe();

    // Load Chat Settings
    loadChatSettings();

    // Load spammer list
    $.getJSON('https://api.betterttv.net/2/spammers').done(function(data) {
        store.spammers = [];
        for (var i = 0; i < data.users.length; i++) {
            store.spammers.push(data.users[i].name);
        }
    });
    $('body').off('click', '.chat-line .message.spam').on('click', '.chat-line .message.spam', function() {
        var user = $(this).parent().data('sender');
        $(this).replaceWith(templates.message(user, decodeURIComponent($(this).data('raw')), {forced: true}));
    });

    // Hover over links
    var hoverLink = debounce(function() {
        var $this = $(this);

        if ($this.hasClass('chat-preview')) return;

        var encodedURL = encodeURIComponent($this.attr('href'));
        $.getJSON('https://api.betterttv.net/2/link_resolver/' + encodedURL).done(function(data) {
            if (!data.tooltip || !$this.is(':hover')) return;

            $this.tipsy({
                trigger: 'manual',
                gravity: $.fn.tipsy.autoNS,
                html: true,
                title: function() { return data.tooltip; }
            });
            $this.tipsy('show');
        });
    }, 250);
    $('body').off('mouseover', '.chat-line .message a').on('mouseover', '.chat-line .message a', hoverLink).off('mouseout', '.chat-line .message a').on('mouseout', '.chat-line .message a', function() {
        hoverLink.cancel();
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // Hover over icons
    $('body').off('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseover', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: 'sw'
        });
        $(this).tipsy('show');
    }).off('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a').on('mouseout', '.chat-line .badges .badge, .chat-line .mod-icons a', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // hover over mod card icons
    $('body').off('mouseover', '.bttv-mod-card button').on('mouseover', '.bttv-mod-card button', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: 's'
        });
        $(this).tipsy('show');
    }).off('mouseout', '.bttv-mod-card button').on('mouseout', '.bttv-mod-card button', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // hover over emoji images
    $('body').off('mouseover', '.chat-line .emoji').on('mouseover', '.chat-line .emoji', function() {
        $(this).tipsy({
            trigger: 'manual',
            gravity: 's'
        });
        $(this).tipsy('show');
    }).off('mouseout', '.chat-line .emoji').on('mouseout', '.chat-line .emoji', function() {
        $(this).tipsy('hide');
        $('div.tipsy').remove();
    });

    // Make Timeout/Ban/Unban buttons work and Turbo/Subscriber clickable
    $('body').off('click', '.chat-line .mod-icons .timeout').on('click', '.chat-line .mod-icons .timeout', function() {
        helpers.timeout($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off('click', '.chat-line .mod-icons .ban').on('click', '.chat-line .mod-icons .ban', function() {
        helpers.ban($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').hide();
        $(this).parent().children('.unban').show();
    }).off('click', '.chat-line .mod-icons .unban').on('click', '.chat-line .mod-icons .unban', function() {
        helpers.unban($(this).parents('.chat-line').data('sender'));
        $(this).parent().children('.ban').show();
        $(this).parent().children('.unban').hide();
    }).off('click', '.chat-line .badges .badge').on('click', '.chat-line .badges .badge', function() {
        var $el = $(this);
        var action = $el.data('click-action');
        if (action === 'turbo') {
            window.open('/products/turbo?ref=chat_badge', '_blank');
        } else if (action === 'subscribe_to_channel') {
            window.open(Twitch.url.subscribe(bttv.getChannel(), 'in_chat_subscriber_link'), '_blank');
        } else if (action === 'visit_url') {
            // Kinda hacky way, also can't currently test
            var type = this.classList[0].split('-');
            var badge = store.__twitchBadgeTypes[type[1]].versions[type[2]];
            window.open(badge.click_url, '_blank');
        }
    });

    // Make names clickable
    var clickCounter = 0;
    $('body').off('click', '.chat-line .from, .chat-line .user-mention').on('click', '.chat-line .from, .chat-line .user-mention', function(e) {
        if (e.shiftKey) return;

        var $element = $(this);
        var sender;
        if ($element.hasClass('user-mention')) {
            sender = $element.text().toLowerCase().substring(1);
        } else {
            sender = ($element.data('sender') || $element.parent().data('sender')).toString();
        }

        if (clickCounter > 0) return clickCounter++;

        setTimeout(function() {
            if (clickCounter >= 2 && bttv.settings.get('dblClickAutoComplete') === true) {
                $('.ember-chat .chat-interface').find('textarea').val('@' + helpers.lookupDisplayName(sender, false) + ', ');
            } else {
                handlers.moderationCard(sender, $element);
            }

            clickCounter = 0;
        }, 250);

        clickCounter++;
    }).on('mousedown', '.chat-line .from', function(e) {
        if (e.which === 3 && !bttv.settings.get('customTOShiftOnly') || e.shiftKey) {
            customTimeouts($(this).data('sender') || $(this).parent().data('sender'), $(this));
        }
    }).on('contextmenu', '.chat-line .from', function(e) {
        if (!helpers.isModerator(vars.userData.name)) return true;
        if (bttv.settings.get('customTOShiftOnly') && !e.shiftKey) return true;
        return false;
    });

    // Give some tips to Twitch Emotes
    if (bttv.TwitchEmoteSets && tmi.product && tmi.product.emoticons) {
        for (i = 0; i < tmi.product.emoticons.length; i++) {
            var emote = tmi.product.emoticons[i];

            if (emote.state && emote.state === 'active' && !bttv.TwitchEmoteSets[emote.emoticon_set]) {
                channel = bttv.getChannel();
                $.post('https://api.betterttv.net/2/emotes/channel_tip/' + encodeURIComponent(channel)).done(function() {
                    debug.log('Gave an emote tip about ' + channel);
                }).fail(function() {
                    debug.log('Error giving an emote tip about ' + channel);
                });
                break;
            }
        }
    }

    // Make chat translatable
    if (!vars.loadedDoubleClickTranslation && bttv.settings.get('dblclickTranslation') !== false) {
        vars.loadedDoubleClickTranslation = true;
        $('body').on('dblclick', '.chat-line .message', function() {
            var sender = $(this).parent().data('sender');
            var message = decodeURIComponent($(this).data('raw'));

            if ($(this).hasClass('timed-out')) {
                $(this).replaceWith(templates.message(sender, message));
            } else {
                helpers.translate($(this), sender, message);
                $(this).text('Translating..');
            }
            $('div.tipsy').remove();
        });
    }

    var $chatInterface = $('.ember-chat .chat-interface');
    var $chatInput = $chatInterface.find('textarea');
    var $chatSend = $chatInterface.find('.js-chat-buttons__submit');

    // Limit chat input to 500 characters
    $chatInput.attr('maxlength', '500');

    // Disable Twitch's chat senders
    $chatInput.off('keydown').off('keyup').off('mouseup');
    $chatSend.off();

    // Message input features (tab completion, message history)
    $chatInput.on('keyup', function(e) {
        // '@' completion is captured only on keyup
        if (e.which === keyCodes.Tab || e.which === keyCodes.Shift) return;
        helpers.tabCompletion(e);
        helpers.whisperReply(e);
    });

    // Implement our own text senders (+ commands & legacy tab completion)
    $chatInput.on('keydown', function(e) {
        var $suggestions = $chatInterface.find('.suggestions');

        if (e.which === keyCodes.Enter) {
            var val = $chatInput.val().trim(),
                bttvCommand = false;
            if (e.shiftKey || !val.length) {
                return e.preventDefault();
            }

            if ($suggestions.length) {
                $suggestions.find('.highlighted').children().click();
                return e.preventDefault();
            }

            if (val.charAt(0) === '/') {
                bttvCommand = handlers.commands(val);
            }

            // Easter Egg Kappa
            var words = val.toLowerCase().split(' ');
            if (words.indexOf('twitch') > -1 && words.indexOf('amazon') > -1 && words.indexOf('google') > -1) {
                helpers.serverMessage('<img src="https://cdn.betterttv.net/special/twitchtrollsgoogle.gif"/>');
            }

            if (!bttvCommand) {
                helpers.sendMessage(val);
            }

            if (bttv.settings.get('chatLineHistory') === true) {
                if (store.chatHistory.indexOf(val) !== -1) {
                    store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
                }
                store.chatHistory.unshift(val);
            }

            $chatInput.val('');
            return e.preventDefault();
        }

        if ($suggestions.length && e.which !== keyCodes.Shift) {
            $suggestions.remove();
        }

        if (e.which === keyCodes.Tab && !e.ctrlKey) {
            helpers.tabCompletion(e);
            e.preventDefault();
        }

        helpers.chatLineHistory($chatInput, e);
    });
    $chatSend.on('click', function(e) {
        // Prevents Twitch's event handlers from running on this click
        e.stopImmediatePropagation();

        var val = $chatInput.val().trim(),
            bttvCommand = false;

        if (!val.length) return;

        if (val.charAt(0) === '/') {
            bttvCommand = handlers.commands(val);
        }

        if (!bttvCommand) {
            helpers.sendMessage(val);
        }

        if (bttv.settings.get('chatLineHistory') === true) {
            if (store.chatHistory.indexOf(val) !== -1) {
                store.chatHistory.splice(store.chatHistory.indexOf(val), 1);
            }
            store.chatHistory.unshift(val);
        }

        $chatInput.val('');
    });

    // watch for current room changes (swap between group chat + channel chat)
    bttv.getChatController().removeObserver('currentRoom', handlers.shiftQueue);
    bttv.getChatController().addObserver('currentRoom', handlers.shiftQueue);

    $('.ember-chat .chat-messages .chat-line').remove();
    $.getJSON('https://api.betterttv.net/2/channels/' + encodeURIComponent(bttv.getChannel()) + '/history').done(function(data) {
        if (data.messages.length) {
            data.messages.forEach(function(message) {
                var badges = {};
                if (message.user.name === message.channel.name) badges.broadcaster = '1';

                if (bttv.chat.helpers.isIgnored(message.user.name)) return;

                message = bttv.chat.templates.privmsg({
                    message: message.message,
                    time: (new Date(message.date.replace('T', ' ').replace(/\.[0-9]+Z/, ' GMT'))).toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2'),
                    nickname: message.user.displayName,
                    sender: message.user.name,
                    badges: bttv.chat.helpers.assignBadges(badges),
                    color: bttv.chat.helpers.calculateColor(message.user.color),
                    emotes: message.parsedEmotes
                });

                $('.ember-chat .chat-messages .tse-content .chat-lines').append(message);
            });
        }
    }).always(function() {
        helpers.serverMessage('<center><small>BetterTTV v' + bttv.info.version + ' Loaded.</small></center>');
        helpers.serverMessage('Welcome to ' + helpers.lookupDisplayName(bttv.getChannel()) + '\'s chat room!', true);

        bttv.chat.helpers.scrollChat();
    });

    bttv.ws.joinChannel();

    // Reset chatters list
    store.chatters = {};
    store.chatters[bttv.getChannel()] = {lastWhisper: 0};

    // Active Tab monitoring - Useful for knowing if a user is 'watching' chat
    $(window).off('blur focus').on('blur focus', function(e) {
        var prevType = $(this).data('prevType');

        if (prevType !== e.type) {   //  reduce double fire issues
            if (e.type === 'blur') {
                store.activeView = false;
            } else if (e.type === 'focus') {
                store.activeView = true;
            }
        }

        $(this).data('prevType', e.type);
    });

    // Keycode to quickly timeout users
    $(window).off('keydown').on('keydown', function(e) {
        if ($('.bttv-mod-card').length && bttv.settings.get('modcardsKeybinds') === true) {
            var keyCode = e.keyCode || e.which;
            var user = $('.bttv-mod-card').data('user');
            var isMod = vars.userData.isLoggedIn && helpers.isModerator(vars.userData.name);

            if (keyCode === keyCodes.Esc) {
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.t && isMod) {
                helpers.timeout(user);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.p && isMod) {
                helpers.timeout(user, 1);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.a && isMod) {
                helpers.sendMessage('!permit ' + user);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.u && isMod) {
                helpers.sendMessage('/unban ' + user);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.b && isMod) {
                helpers.ban(user);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.i) {
                helpers.sendMessage('/ignore ' + user);
                $('.bttv-mod-card').remove();
            }
            if (keyCode === keyCodes.w) {
                e.preventDefault();
                $chatInput = $('.ember-chat .chat-interface').find('textarea');
                $chatInput.val('/w ' + user + ' ');
                $chatInput.focus();
                $('.bttv-mod-card').remove();
            }
        }
    });
};
