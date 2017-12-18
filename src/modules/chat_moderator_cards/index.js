const $ = require('jquery');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');
const keyCodes = require('../../utils/keycodes');
const modCards = require('./mod-cards');

const VIEWER_CARD_CLOSE = '.viewer-card__hide button';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_USERNAME_SELECTOR = '.chat-line__username';
const VIEWER_LIST_USERNAME_SELECTOR = '.chat-viewers-list__button';
const MENTION_SELECTOR = '.chat-line__message [data-a-target="chat-message-mention"]';
const CHAT_INPUT_SELECTOR = '.chat-input textarea';

const INPUT_EVENT = new Event('input', { bubbles: true });
function setTextareaValue($inputField, msg) {
    $inputField.val(msg)[0].dispatchEvent(INPUT_EVENT);
}

function getUserDataFromId(id) {
    return twitchAPI.get(`/channels/${id}`);
}

function getUserDataFromName(login) {
    return twitchAPI.get('users', {qs: {login}})
        .then(({users}) => users.length && getUserDataFromId(users[0]._id));
}

function openViewerCard(name) {
    try {
        twitch.getReactElement($(CHAT_LINE_SELECTOR)[0])._owner._instance.props.onUsernameClick(name);
    } catch (_) {}
}

class ChatModCardsModule {
    constructor() {
        settings.add({
            id: 'modcardsKeybinds',
            name: 'Enable Keybinds for Moderator Cards',
            defaultValue: false,
            description: 'Add keybinds to moderate users faster.'
        });
        $('body')
            .on('click.modCard_chatName', CHAT_LINE_USERNAME_SELECTOR, e => this.onUsernameClick(e))
            .on('click.modCard_viewerList', VIEWER_LIST_USERNAME_SELECTOR, e => this.onViewerListClick(e))
            .on('click.modCard_mention', MENTION_SELECTOR, e => this.onMentionClick(e))
            .on('click.modCard_action', modCards.BTTV_ACTION_SELECTOR, e => this.onModActionClick(e))
            .on('keydown.modCard', e => this.onKeydown(e));
        this.targetUser = {};
    }

    onMentionClick(e) {
        if (e.originalEvent.detail !== 1) return;
        const $target = $(e.currentTarget);
        const name = $target.text().substr(1).toLowerCase();

        this.createFromName(name);
        openViewerCard(name);
    }

    onViewerListClick(e) {
        const $target = $(e.currentTarget);
        const name = $target.attr('data-username');

        this.createFromName(name);
    }

    createFromName(name) {
        if (this.targetUser.name === name) {
            if (this.isOpen()) {
                return;
            }
        }

        this.targetUser = {
            name: name,
            isOwner: name === twitch.getCurrentChannel().name,
            isMod: false, // assume target user can be moderated.
            dataPromise: getUserDataFromName(name)
        };
        this.onRenderModcards();
    }

    onUsernameClick(e) {
        const $target = $(e.currentTarget);
        const $line = $target.closest(CHAT_LINE_SELECTOR);
        const messageObj = twitch.getChatMessageObject($line[0]);

        if (this.targetUser.name === messageObj.user.userLogin) {
            if (this.isOpen()) {
                return;
            }
        }

        const dataPromise = messageObj.user.userID ?
            getUserDataFromId(messageObj.user.userID) :
            getUserDataFromName(messageObj.user.userLogin);

        this.targetUser = {
            name: messageObj.user.userLogin,
            isOwner: twitch.getUserIsOwnerFromTagsBadges(messageObj.badges),
            isMod: twitch.getUserIsModeratorFromTagsBadges(messageObj.badges),
            dataPromise
        };
        this.onRenderModcards();
    }

    onRenderModcards() {
        clearInterval(this.renderInterval);
        // initial load of a card requires to render asynchronously
        this.lazyRender(() => {
            modCards.render(this.targetUser);
        });
    }

    lazyRender(callback) {
        const currentRenderInterval = setInterval(() => {
            if (this.isOpen()) {
                clearInterval(currentRenderInterval);
                callback && callback();
            }
        }, 25);
        setTimeout(() => clearInterval(currentRenderInterval), 3000);
        this.renderInterval = currentRenderInterval;
    }

    onModActionClick(e) {
        const $action = $(e.currentTarget);
        const action = $action.attr(modCards.BTTV_ACTION_ATTR);
        const actionCommand = modCards.ACTIONS[action].action;
        const actionVal = $action.attr(modCards.BTTV_ACTION_VAL_ATTR);
        if (!action || !this.targetUser.name) return;

        if (action === modCards.ACTIONS.MESSAGES.id) {
            return modCards.renderUserChatMessages(this.targetUser.name);
        }
        if (actionCommand) {
            twitch.sendChatMessage(`${actionCommand} ${this.targetUser.name} ${actionVal}`);
        }
    }

    close() {
        $(VIEWER_CARD_CLOSE).click();
    }

    isOpen() {
        return $('.viewer-card__overlay').length > 0;
    }

    onKeydown(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        if ($('input, textarea, select').is(':focus')) return;
        if (!this.isOpen()) return;

        const keyCode = e.keyCode || e.which;
        if (keyCode === keyCodes.Esc) {
            return this.close();
        }

        if (!settings.get('modcardsKeybinds')) return;

        const userName = this.targetUser.name;
        if (!userName) return;

        const isMod = twitch.getCurrentUserIsModerator();
        if (keyCode === keyCodes.t && isMod) {
            twitch.sendChatMessage('/timeout ' + userName);
            this.close();
        } else if (keyCode === keyCodes.p && isMod) {
            twitch.sendChatMessage('/timeout ' + userName + ' 1');
            this.close();
        } else if (keyCode === keyCodes.a && isMod) {
            twitch.sendChatMessage('!permit ' + userName);
            this.close();
        } else if (keyCode === keyCodes.u && isMod) {
            twitch.sendChatMessage('/unban ' + userName);
            this.close();
        } else if (keyCode === keyCodes.b && isMod) {
            twitch.sendChatMessage('/ban ' + userName);
            this.close();
        } else if (keyCode === keyCodes.i) {
            twitch.sendChatMessage('/ignore ' + userName);
            this.close();
        } else if (keyCode === keyCodes.w) {
            e.preventDefault();
            e.stopPropagation();
            const $inputField = $(CHAT_INPUT_SELECTOR);
            setTextareaValue($inputField, `/w ${userName} `);
            $inputField.focus();
            this.close();
        }
    }
}


module.exports = new ChatModCardsModule();
