const $ = require('jquery');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');
const watcher = require('../../watcher');
const moderatorCard = require('./moderator-card');
const nicknames = require('../chat_nicknames');

const CHAT_ROOM_SELECTOR = '.chat-room';
const CHAT_LINE_SELECTOR = '.chat-room .chat-messages .chat-line';
const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';
const MODERATOR_CARD_SELECTOR = '.moderation-card';
const EMBER_CHAT_SELECTOR = '.ember-chat';
const USERNAME_SELECTORS = '.chat-line span.from, .chat-line .mentioning, .chat-line .mentioned';

const STATES = {
    CLOSED: 0,
    OPENING: 1,
    OPEN: 2,
};

let state = STATES.CLOSED;

function getUserChatMessages(id) {
    return $.makeArray($(CHAT_LINE_SELECTOR))
        .reverse()
        .filter(m => {
            const messageObj = twitch.getChatMessageObject(m);
            if (!messageObj || !messageObj.tags) return false;
            return messageObj.tags['user-id'] === id;
        });
}

function closeModeratorCard() {
    $('body').off('keydown.modCard');
    jQuery(MODERATOR_CARD_SELECTOR).remove();
    state = STATES.CLOSED;
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

function toggleFriend($modCard, value) {
    if (value === undefined) {
        value = $modCard.find('.mod-card-friend').text() !== 'Unfriend';
    }
    $modCard.find('.mod-card-friend').text(value ? 'Unfriend' : 'Friend');
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
    if (currentUser) {
        const followEndpoint = `users/${currentUser.id}/follows/channels/${user.id}`;
        twitchAPI.get(followEndpoint)
            .then(() => toggleFollow($modCard, true))
            .catch(() => toggleFollow($modCard, false));
        $modCard.find('.mod-card-follow').click(() => {
            const followed = toggleFollow($modCard);
            const request = followed ? twitchAPI.put(followEndpoint, {auth: true}) : twitchAPI.delete(followEndpoint, {auth: true});
            request.then(() => twitch.sendChatAdminMessage(`You ${!followed ? 'un' : ''}followed ${user.name}`))
                .catch(() => twitch.sendChatAdminMessage(`Error ${!followed ? 'un' : ''}following ${user.name}`));
        });

        const store = twitch.getEmberContainer('service:store');
        if (store) {
            if (store.peekRecord('friends-list-user', user.id)) {
                toggleFriend($modCard, true);
            } else {
                toggleFriend($modCard, false);
            }

            $modCard.find('.mod-card-friend').click(() => {
                const friended = toggleFriend($modCard);

                const action = !friended ? (
                    store.queryRecord('friends-list-user', {
                        type: 'unfriend',
                        id: user.id,
                        login: user.name
                    })
                ) : (
                    store.createRecord('friends-list-request', {
                        friendId: user.id,
                        friendLogin: user.name
                    }).save()
                );

                action.then(() => twitch.sendChatAdminMessage(`You ${!friended ? 'un' : ''}friended ${user.name}`))
                    .catch(() => twitch.sendChatAdminMessage(`Error ${!friended ? 'un' : ''}friending ${user.name}`));
            });
        }
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

class ChatModeratorCardsModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $(CHAT_ROOM_SELECTOR).on('click', '#viewers a', e => {
            e.stopImmediatePropagation();
            const $target = $(e.target);
            const name = $target.text().trim().toLowerCase();
            this.createFromName(name, $target);
        }).on('click', USERNAME_SELECTORS, e => {
            if (e.detail > 1) return;
            e.stopImmediatePropagation();
            const $target = $(e.target);
            if ($target.hasClass('mentioning') || $target.hasClass('mentioned')) {
                this.createFromName($target.text().toLowerCase().replace('@', ''), $target);
            } else {
                const messageObj = twitch.getChatMessageObject($target.closest('.chat-line')[0]);
                if (!messageObj) return;
                // If there is no id, the user must be yourself
                const currentUser = twitch.getCurrentUser();
                if (!currentUser) return;
                const id = messageObj.tags['user-id'] || currentUser.id;
                this.create(id, $target);
            }
        });
    }

    create(id, $el, startTime) {
        if (state === STATES.OPENING && !startTime) return;
        state = STATES.OPENING;

        startTime = startTime || Date.now();

        twitchAPI.get(`channels/${id}`)
            .then(user => {
                const elapsed = Date.now() - startTime;

                setTimeout(() => {
                    if (state === STATES.CLOSED) return;
                    state = STATES.OPEN;
                    user.id = user._id;
                    delete user._id;
                    // adds in user messages from chat
                    user.messages = getUserChatMessages(id);
                    renderModeratorCard(user, $el);
                    $('body').on('keydown.modCard', e => this.onKeyDown(e, user));
                }, elapsed < 250 ? 250 - elapsed : 0);
            });
    }

    createFromName(login, $el) {
        if (state === STATES.OPENING) return;
        state = STATES.OPENING;

        const startTime = Date.now();

        twitchAPI.get('users', {qs: {login}})
            .then(({users}) => users.length && this.create(users[0]._id, $el, startTime));
    }

    close() {
        closeModeratorCard();
    }

    onKeyDown(e, user) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        if ($('input, textarea, select').is(':focus')) return;

        const keyCode = e.keyCode || e.which;
        const isMod = twitch.getCurrentUserIsModerator();

        if (keyCode === keyCodes.Esc) {
            this.close();
        } else if (keyCode === keyCodes.t && isMod) {
            twitch.sendChatMessage('/timeout ' + user.name);
            this.close();
        } else if (keyCode === keyCodes.p && isMod) {
            twitch.sendChatMessage('/timeout ' + user.name + ' 1');
            this.close();
        } else if (keyCode === keyCodes.a && isMod) {
            twitch.sendChatMessage('!permit ' + user.name);
            this.close();
        } else if (keyCode === keyCodes.u && isMod) {
            twitch.sendChatMessage('/unban ' + user.name);
            this.close();
        } else if (keyCode === keyCodes.b && isMod) {
            twitch.sendChatMessage('/ban ' + user.name);
            this.close();
        } else if (keyCode === keyCodes.i) {
            twitch.sendChatMessage('/ignore ' + user.name);
            this.close();
        } else if (keyCode === keyCodes.w) {
            e.preventDefault();
            const $chatInput = $(CHAT_TEXT_AREA);
            $chatInput.val('/w ' + user.name + ' ');
            $chatInput.focus();
            this.close();
        }
    }
}

module.exports = new ChatModeratorCardsModule();
