module.exports = function(user, $event) {
    // adds in user messages from chat
    user.messages = $.makeArray($('.chat-room .chat-messages .chat-line[data-sender="' + user.name + '"]')).reverse();

    var top = Math.max(0, Math.min($event.offset().top + 25, window.innerHeight - 200));
    var left = Math.max(0, Math.min($event.offset().left - 25, window.innerWidth - 290));
    var template = bttv.chat.templates.moderationCard(user, top, left);
    $('.ember-chat .moderation-card').remove();
    $('.ember-chat').append(template);

    var $modCard = $('.ember-chat .moderation-card[data-user="' + user.name + '"]');

    $modCard.find('.close-button').click(function() {
        $modCard.remove();
    });
    $modCard.find('.user-messages .label').click(function() {
        $modCard.find('.user-messages .chat-messages').toggle('fast');

        var triangle = $(this).find('.triangle');
        if (triangle.hasClass('open')) {
            triangle.removeClass('open').addClass('closed');
        } else {
            triangle.removeClass('closed').addClass('open');
        }
    });
    $modCard.find('.permit').click(function() {
        bttv.chat.helpers.sendMessage('!permit ' + user.name);
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.timeout').click(function() {
        bttv.chat.helpers.timeout(user.name, $(this).data('time'));
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.ban').click(function() {
        bttv.chat.helpers.ban(user.name);
        $modCard.remove();
        $('div.tipsy').remove();
    });
    $modCard.find('.mod-card-profile').click(function() {
        window.open(Twitch.url.profile(user.name), '_blank');
    });
    $modCard.find('.mod-card-message').click(function() {
        window.open(Twitch.url.compose(user.name), '_blank');
    });
    $modCard.find('.mod-card-whisper').click(function() {
        var conversations = App.__container__.lookup('service:twitch-conversations/conversations');
        conversations.startConversationForUsername(user.name);
    });
    $modCard.find('.mod-card-edit').click(function() {
        var nickname = prompt('Enter the new nickname for ' + user.display_name + '. (Leave blank to reset...)');

        // prompt returns null on cancel
        if (nickname === null) return;

        // empty string = reset
        if (nickname.length) {
            nickname = nickname.trim();
            if (!nickname.length) return;

            bttv.storage.pushObject('nicknames', user.name, nickname);
            $modCard.find('h3.name a').text(nickname);
            $('.chat-line[data-sender="' + user.name + '"] .from').text(nickname);
        } else {
            bttv.storage.spliceObject('nicknames', user.name);
            $modCard.find('h3.name a').text(user.display_name);
            $('.chat-line[data-sender="' + user.name + '"] .from').text(user.display_name);
        }
    });

    if (bttv.chat.helpers.isIgnored(user.name)) {
        $modCard.find('.mod-card-ignore .svg-ignore').hide();
        $modCard.find('.mod-card-ignore .svg-unignore').show();
    }
    $modCard.find('.mod-card-ignore').click(function() {
        if ($modCard.find('.mod-card-ignore .svg-unignore').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unignore ' + user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').show();
            $modCard.find('.mod-card-ignore .svg-unignore').hide();
        } else {
            bttv.chat.helpers.sendMessage('/ignore ' + user.name);
            $modCard.find('.mod-card-ignore .svg-ignore').hide();
            $modCard.find('.mod-card-ignore .svg-unignore').show();
        }
    });

    if (bttv.chat.helpers.isModerator(user.name)) {
        $modCard.find('.mod-card-mod .svg-add-mod').hide();
        $modCard.find('.mod-card-mod .svg-remove-mod').show();
    }
    $modCard.find('.mod-card-mod').click(function() {
        if ($modCard.find('.mod-card-mod .svg-remove-mod').css('display') !== 'none') {
            bttv.chat.helpers.sendMessage('/unmod ' + user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').show();
            $modCard.find('.mod-card-mod .svg-remove-mod').hide();
        } else {
            bttv.chat.helpers.sendMessage('/mod ' + user.name);
            $modCard.find('.mod-card-mod .svg-add-mod').hide();
            $modCard.find('.mod-card-mod .svg-remove-mod').show();
        }
    });

    bttv.TwitchAPI.get('users/:login/follows/channels/' + user.name).done(function() {
        $modCard.find('.mod-card-follow').text('Unfollow');
    }).fail(function() {
        $modCard.find('.mod-card-follow').text('Follow');
    });
    $modCard.find('.mod-card-follow').text('Unfollow').click(function() {
        if ($modCard.find('.mod-card-follow').text() === 'Unfollow') {
            bttv.TwitchAPI.del('users/:login/follows/channels/' + user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was unfollowed successfully.', true);
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.', true);
            });
            $modCard.find('.mod-card-follow').text('Follow');
        } else {
            bttv.TwitchAPI.put('users/:login/follows/channels/' + user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was followed successfully.', true);
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.', true);
            });
            $modCard.find('.mod-card-follow').text('Unfollow');
        }
    });

    $modCard.draggable({ handle: '.drag-handle', containment: 'body', el: $modCard });

    $('.chat-line[data-sender="' + user.name + '"]').addClass('bttv-user-locate');
    $modCard.on('remove', function() {
        $('.chat-line[data-sender="' + user.name + '"]').removeClass('bttv-user-locate');
    });
};
