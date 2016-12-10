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
    customTimeouts = require('../features/custom-timeouts'),
    tmi = require('./tmi');

var reloadChatSettings = function(sender, key) {
    if (bttv.getChatController().get(key)) return;
    setTimeout(function() {
        loadChatSettings();
    }, 1000);
};

var takeover = module.exports = function() {
    var currentRoom = tmi();
    var channelName = currentRoom.get('id');

    // Anonymize Chat if it isn't already
    anonChat();

    // Setup room
    store.currentRoom = channelName;
    rooms.newRoom(channelName);

    // Takes over whisper replies (actually all messages Twitch still emits)
    currentRoom.set('addMessage', function(d) {
        // hide admin messages until after load
        if (!store.isLoaded && d.style === 'admin') return;
        handlers.onPrivmsg(channelName, d);
    });

    // Hide Friends Activities
    if (bttv.settings.get('hideFriendsChatActivity')) {
        currentRoom.set('addFriendsWatchingMessage', function() {});
    }

    // Hides Group List if coming from directory
    bttv.getChatController().set('showList', false);

    // Wait for chat load, and don't load again after load
    if (store.isLoaded) return;
    currentRoom.removeObserver('isLoading', takeover);
    if (currentRoom.get('isLoading')) {
        $('.chat-messages .chat-lines').hide();
        currentRoom.addObserver('isLoading', takeover);
        return;
    }
    store.isLoaded = true;

    $('.chat-messages .ember-view.chat-line').remove();
    $('.chat-messages .chat-lines').show();
    helpers.serverMessage('<center><small>BetterTTV v' + bttv.info.version + ' Loaded.</small></center>');
    helpers.serverMessage('Welcome to ' + helpers.lookupDisplayName(channelName) + '\'s chat room!', true);
    currentRoom.set('unreadCount', 0);
    var dupIds = [];
    var unrenderedMessages = currentRoom._queuedRawMessages
        .concat(currentRoom._queuedMessages)
        .concat(currentRoom.delayedMessages)
        .concat(currentRoom.messages)
        .filter(function(m) {
            if (m.tags) {
                if (dupIds.indexOf(m.tags.id) === -1) return false;
                dupIds.push(m.tags.id);
            }
            return m.style !== 'admin';
        });
    currentRoom.set('delayedMessages', []);
    currentRoom.set('messages', []);
    currentRoom.set('_queuedMessages', []);
    currentRoom.set('_queuedRawMessages', []);
    unrenderedMessages.forEach(currentRoom.addMessage);

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
    if (typeof settings.showModerationActions === 'undefined') {
        settings.showModerationActions = true;
        $('.ember-chat .chat-messages').removeClass('hideModerationActions');
        bttv.storage.putObject('chatSettings', settings);
    }
    if (settings.darkMode === true) {
        settings.darkMode = false;
        $('.chat-container').removeClass('dark');
        bttv.storage.putObject('chatSettings', settings);
        bttv.settings.save('darkenedMode', true);
    }

    if (bttv.settings.get('disableUsernameColors') === true) {
        $('.ember-chat .chat-room').addClass('no-name-colors');
    } else {
        $('.ember-chat .chat-room').removeClass('no-name-colors');
    }

    // We need a way to grab onto the chat header
    if (!$('.ember-chat .chat-header:first').hasClass('main-header')) {
        $('.ember-chat .chat-header:first').addClass('main-header');
    }

    // Take over listeners
    debug.log('Loading chat listeners');
    for (var channel in currentRoom.tmiSession._rooms) {
        if (currentRoom.tmiSession._rooms.hasOwnProperty(channel)) {
            delete currentRoom.tmiSession._rooms[channel]._events.message;
            delete currentRoom.tmiSession._rooms[channel]._events.clearchat;
            delete currentRoom.tmiSession._rooms[channel]._events.notice;
        }
    }

    // Handle Channel Chat
    rooms.getRoom(channelName).delay = currentRoom.roomProperties.chat_delay_duration;
    currentRoom.tmiRoom.on('message', rooms.getRoom(channelName).chatHandler);
    currentRoom.tmiRoom.on('clearchat', handlers.clearChat.bind(this, rooms.getRoom(channelName)));
    currentRoom.tmiRoom.on('notice', handlers.notice);
    currentRoom.tmiRoom.on('roomstate', helpers.parseRoomState);
    currentRoom.get('pubsub').off('chat_login_moderation').on('chat_login_moderation', function(e) {
        console.log(e);

        if (e.moderation_action === 'twitchbot_rejected') {
            var message = templates.twitchbotRejected(e);
            store.__messageQueue.push({message: $(message), date: new Date(0)});
            handlers.shiftQueue();
            return;
        }

        if (['timeout', 'ban'].indexOf(e.moderation_action) === -1) {
            return currentRoom.get('addLoginModerationMessage').call(currentRoom, e);
        }

        handlers.clearChat(rooms.getRoom(channelName), e.args[0], {
            'ban-reason': e.moderation_action === 'timeout' ? e.args[2] : e.args[1],
            'ban-created-by': e.created_by,
            'ban-duration': e.moderation_action === 'timeout' ? e.args[1] : undefined
        }, true);
    });
    if (currentRoom.channel) currentRoom.set('name', currentRoom.channel.get('display_name'));

    // Fake the initial roomstate
    helpers.parseRoomState({
        tags: {
            'subs-only': currentRoom.get('subsOnly') || false,
            slow: currentRoom.get('slow') || 0,
            r9k: currentRoom.get('r9k') || false,
            'emote-only': currentRoom.get('emoteOnly') || false
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

    // Load Subscriber badges (if needed)
    helpers.loadSubBadges();

    // Load BTTV channel emotes/bots
    helpers.loadBTTVChannelData();

    // Load Volunteer Badges
    helpers.loadBTTVBadges();
    bttv.ws.broadcastMe();

    // Load Chat Settings
    setTimeout(function() {
        loadChatSettings();
    }, 500);

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
            window.open(Twitch.url.subscribe(channelName, 'in_chat_subscriber_link'), '_blank');
        } else if (action === 'visit_url') {
            // Kinda hacky way, also can't currently test
            var type = this.classList[0].split('-');
            var badge = store.__twitchBadgeTypes[type[1]].versions[type[2]];
            window.open(badge.click_url, '_blank');
        }
    });

    // Hide button for Past Broadcast banner
    $('body').off('click', '.recent-past-broadcast__message_sub').on('click', '.recent-past-broadcast__message_sub', function(e) {
        if (e.offsetX > e.target.offsetWidth - 26) $('.recent-past-broadcast').hide();
    });

    // Dismiss pinned cheers
    $('body').off('click', '.pinned-cheers').on('click', '.pinned-cheers', function(e) {
        if (!e.target.classList.contains('pinned-cheers')) return;
        if (e.target.offsetWidth - e.offsetX < 48 && e.target.offsetHeight - e.offsetY > 88) $('.pinned-cheers').hide();
    });

    // Dismiss pinned cheers
    $('body').off('click', '.chat-line.twitchbot a').on('click', '.chat-line.twitchbot a', function(e) {
        var $button = $(e.target);
        var action = $button.attr('data-action');
        var $chatline = $button.closest('.chat-line');
        if (action === 'yes' || action === 'no') {
            var apiService = window.App.__container__.lookup('service:api');
            var url = (action === 'yes') ? 'chat/twitchbot/approve' : 'chat/twitchbot/deny';
            apiService.authRequest('post', url, {msg_id: $chatline.attr('data-id')}, {version: 5});
        }
        $chatline.append('<div class="system-msg"><p>Thank you for your response!</p><br></div>');
        $chatline.find('.inline-warning').remove();
        $chatline.find('.pd-y-1').remove();

        try {  // Help twitch with tracking
            var trackingService = window.App.__container__.lookup('service:tracking');
            trackingService.trackEvent({
                event: 'clicked_twitchbot_response',
                services: ['spade'],
                data: Object.assign({
                    click_type: action,
                    msg_id: $chatline.attr('data-id')
                }, currentRoom.getTrackingData())
            });
        } catch (exception) {}
    });

    // Make names clickable
    var clickCounter = 0;
    $('body').off('click', '.chat-line .from, .chat-line .user-mention').on('click', '.chat-line .from, .chat-line .user-mention', function(e) {
        if (e.shiftKey) return;

        e.preventDefault();

        var $element = $(this);
        var $chatLineId = $element.closest('.chat-line').attr('id');
        var sender;
        if ($chatLineId && $chatLineId.indexOf('ember') > -1) {
            sender = App.__container__.lookup('-view-registry:main')[$chatLineId].msgObject.from;
        } else if ($element.hasClass('user-mention')) {
            sender = $element.text().toLowerCase().substring(1);
        } else {
            sender = ($element.data('sender') || $element.parent().data('sender')).toString();
        }

        if (bttv.settings.get('dblClickAutoComplete') === true) {
            if (clickCounter > 0) return clickCounter++;

            setTimeout(function() {
                if (clickCounter >= 2) {
                    $('.ember-chat .chat-interface').find('textarea').val('@' + helpers.lookupDisplayName(sender, false) + ', ');
                } else {
                    handlers.moderationCard(sender, $element);
                }

                clickCounter = 0;
            }, 250);

            clickCounter++;
        } else {
            handlers.moderationCard(sender, $element);
        }
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
    if (bttv.TwitchEmoteSets && currentRoom.product && currentRoom.product.emoticons) {
        for (i = 0; i < currentRoom.product.emoticons.length; i++) {
            var emote = currentRoom.product.emoticons[i];

            if (emote.state && emote.state === 'active' && !bttv.TwitchEmoteSets[emote.emoticon_set]) {
                $.post('https://api.betterttv.net/2/emotes/channel_tip/' + encodeURIComponent(channelName)).done(function() {
                    debug.log('Gave an emote tip about ' + channelName);
                }).fail(function() {
                    debug.log('Error giving an emote tip about ' + channelName);
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
    bttv.getChatController().removeObserver('hidden', reloadChatSettings);
    bttv.getChatController().addObserver('hidden', reloadChatSettings);

    bttv.ws.joinChannel();

    // Reset chatters list
    store.chatters = {};
    store.chatters[channelName] = {lastWhisper: 0};

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
