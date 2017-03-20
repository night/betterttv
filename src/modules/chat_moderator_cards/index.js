const $ = require('jquery');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');
const watcher = require('../../watcher');
const moderatorCard = require('./moderator-card');
const nicknames = require('../chat_nicknames');

const CHAT_ROOM_SELECTOR = '.chat-room';
const CHAT_LINE_SELECTOR = '.chat-room .chat-messages .chat-line';
const MODERATOR_CARD_SELECTOR = '.moderation-card';
const EMBER_CHAT_SELECTOR = '.ember-chat';

function getUserChatMessages(id) {
    return $.makeArray($(CHAT_LINE_SELECTOR))
        .reverse()
        .filter(m => {
            const {tags} = twitch.getChatMessageObject(m);
            return tags && tags['user-id'] === id;
        });
}

function closeModeratorCard() {
    jQuery(MODERATOR_CARD_SELECTOR).remove();
}

function toggleIgnore($modCard, value) {
    if (value === undefined) {
        value = $modCard.find('.mod-card-ignore .svg-unignore').css('display') === 'none';
    }
    $modCard.find('.mod-card-ignore .svg-ignore').toggle(!value);
    $modCard.find('.mod-card-ignore .svg-unignore').toggle(value);
    return value;
}

function toggleModerator($modCard, value) {
    if (value === undefined) {
        value = $modCard.find('.mod-card-mod .svg-remove-mod').css('display') === 'none';
    }
    $modCard.find('.mod-card-mod .svg-add-mod').toggle(!value);
    $modCard.find('.mod-card-mod .svg-remove-mod').toggle(value);
    return value;
}

function toggleFollow($modCard, value) {
    if (value === undefined) {
        value = $modCard.find('.mod-card-follow').text() !== 'Unfollow';
    }
    $modCard.find('.mod-card-follow').text(value ? 'Unfollow' : 'Follow');
    return value;
}

function renderModeratorCard(user, $el) {
    const top = Math.max(0, Math.min($el.offset().top + 25, window.innerHeight - 200));
    const left = Math.max(0, Math.min($el.offset().left - 25, window.innerWidth - 290));

    const template = moderatorCard(user, top, left);
    closeModeratorCard();
    $(EMBER_CHAT_SELECTOR).append(template);

    const $modCard = $(MODERATOR_CARD_SELECTOR);

    $modCard.find('.close-button').click(() => closeModeratorCard());

    $modCard.find('.user-messages .label').click(function() {
        $modCard.find('.user-messages .chat-messages').toggle('fast');
        const $triangle = $(this).find('.triangle');
        const open = $triangle.hasClass('open');
        $triangle.toggleClass('open', !open).toggleClass('closed', open);
    });

    $modCard.find('.permit').click(() => {
        twitch.sendChatMessage(`!permit ${user.name}`);
        closeModeratorCard();
    });

    $modCard.find('.timeout').click(function() {
        twitch.sendChatMessage(`/timeout ${user.name} ${$(this).data('time')}`);
        closeModeratorCard();
    });

    $modCard.find('.ban').click(() => {
        twitch.sendChatMessage(`/ban ${user.name}`);
        closeModeratorCard();
    });

    $modCard.find('.mod-card-whisper').click(() => {
        const conversations = window.App.__container__.lookup('service:twitch-conversations/conversations');
        conversations.startConversationForUsername(user.name);
    });

    $modCard.find('.mod-card-edit').click(() => {
        const nickname = nicknames.set(user.name);
        $modCard.find('h3.name a').text(nickname ? nickname : user.display_name);
    });

    toggleIgnore($modCard, twitch.getUserIsIgnored(user.name));
    $modCard.find('.mod-card-ignore').click(() => {
        const ignored = toggleIgnore($modCard);
        twitch.sendChatMessage(`/${!ignored ? 'un' : ''}ignore ${user.name}`);
    });

    toggleModerator($modCard, twitch.getUserIsModerator(user.name));
    $modCard.find('.mod-card-mod').click(() => {
        const moderator = toggleModerator($modCard);
        twitch.sendChatMessage(`/${!moderator ? 'un' : ''}mod ${user.name}`);
    });

    const currentUser = twitch.getCurrentUser();
    const followEndpoint = `users/${currentUser.id}/follows/channels/${user.id}`;
    if (currentUser) {
        twitchAPI.get(followEndpoint)
            .then(() => toggleFollow($modCard, true))
            .catch(() => toggleFollow($modCard, false));
        $modCard.find('.mod-card-follow').click(() => {
            const followed = toggleFollow($modCard);
            const request = followed ? twitchAPI.put(followEndpoint, {auth: true}) : twitchAPI.delete(followEndpoint, {auth: true});
            request.then(() => twitch.sendChatAdminMessage(`You ${!followed ? 'un' : ''}followed ${user.name}`))
                .catch(() => twitch.sendChatAdminMessage(`Error ${!followed ? 'un' : ''}following ${user.name}`));
        });
    }

    // use Twitch jQuery for Draggable
    jQuery(MODERATOR_CARD_SELECTOR).draggable({
        handle: '.drag-handle',
        containment: 'body',
        el: $modCard
    });

    $(user.messages).toggleClass('bttv-user-locate', true);
    jQuery(MODERATOR_CARD_SELECTOR).on('remove', () => $(user.messages).toggleClass('bttv-user-locate', false));
}

class ChatCommands {
    constructor() {
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $(CHAT_ROOM_SELECTOR).on('click', '#viewers a', e => {
            e.stopImmediatePropagation();
            const $target = $(e.target);
            const name = $target.text().trim().toLowerCase();
            this.createFromName(name, $target);
        }).on('click', '.chat-line span.from', e => {
            e.stopImmediatePropagation();
            const $target = $(e.target);
            const messageObj = twitch.getChatMessageObject($target.parent()[0]);
            const id = messageObj.tags['user-id'];
            this.create(id, $target);
        });
    }

    create(id, $el) {
        twitchAPI.get(`channels/${id}`)
            .then(user => {
                user.id = user._id;
                delete user._id;
                // adds in user messages from chat
                user.messages = getUserChatMessages(id);
                renderModeratorCard(user, $el);
            });
    }

    createFromName(login, $el) {
        twitchAPI.get('users', {qs: {login}})
            .then(({users}) => users.length && this.create(users[0]._id, $el));
    }

    close() {
        closeModeratorCard();
    }
}

module.exports = new ChatCommands();
