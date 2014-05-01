module.exports = function(user, $event) {
    var template = bttv.chat.templates.moderationCard(user, $event.offset().top, $event.offset().left);
    $('.ember-chat .moderation-card').remove();
    $('.ember-chat').append(template);

    var $modCard = $('.ember-chat .moderation-card[data-user="'+user.name+'"]');

    $modCard.find('.close-button').click(function() {
        $modCard.remove();
    });
    $modCard.find('.permit').click(function() {
        bttv.chat.helpers.sendMessage('!permit '+user.name);
        $modCard.remove();
        $('div.tipsy.tipsy-sw').remove();
    });
    $modCard.find('.timeout').click(function() {
        bttv.chat.helpers.timeout(user.name, $(this).data('time'));
        $modCard.remove();
        $('div.tipsy.tipsy-sw').remove();
    });
    $modCard.find('.ban').click(function() {
        bttv.chat.helpers.ban(user.name);
        $modCard.remove();
        $('div.tipsy.tipsy-sw').remove();
    });
    $modCard.find('.mod-card-profile').click(function() {
        window.open(Twitch.url.profile(user.name),'_blank');
    });
    $modCard.find('.mod-card-message').click(function() {
        window.open(Twitch.url.compose(user.name),'_blank');
    });

    if(bttv.chat.helpers.isIgnored(user.name)) $modCard.find('.mod-card-ignore').text('Unignore');
    $modCard.find('.mod-card-ignore').click(function() {
        if($modCard.find('.mod-card-ignore').text() === 'Unignore') {
            bttv.chat.helpers.sendMessage('/unignore '+user.name);
            $modCard.find('.mod-card-ignore').text('Ignore');
        } else {
            bttv.chat.helpers.sendMessage('/ignore '+user.name);
            $modCard.find('.mod-card-ignore').text('Unignore');
        }
    });

    if(bttv.chat.helpers.isModerator(user.name)) $modCard.find('.mod-card-mod').text('Demod');
    $modCard.find('.mod-card-mod').click(function() {
        if($modCard.find('.mod-card-mod').text() === 'Demod') {
            bttv.chat.helpers.sendMessage('/unmod '+user.name);
            $modCard.find('.mod-card-mod').text('Mod');
        } else {
            bttv.chat.helpers.sendMessage('/mod '+user.name);
            $modCard.find('.mod-card-mod').text('Demod');
        }
    });

    Twitch.api.get('users/:login/follows/channels/'+user.name).done(function() {
        $modCard.find('.mod-card-follow').text('Unfollow');
    }).fail(function() {
        $modCard.find('.mod-card-follow').text('Follow');
    });
    $modCard.find('.mod-card-follow').text('Unfollow').click(function() {
        if($modCard.find('.mod-card-follow').text() === 'Unfollow') {
            Twitch.api.del("users/:login/follows/channels/"+user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was unfollowed successfully.');
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.');
            });
            $modCard.find('.mod-card-follow').text('Follow');
        } else {
            Twitch.api.put("users/:login/follows/channels/"+user.name).done(function() {
                bttv.chat.helpers.serverMessage('User was followed successfully.');
            }).fail(function() {
                bttv.chat.helpers.serverMessage('There was an error following this user.');
            });
            $modCard.find('.mod-card-follow').text('Unfollow');
        }
    });

    $modCard.drags({ handle: ".drag-handle", el: $modCard });
}