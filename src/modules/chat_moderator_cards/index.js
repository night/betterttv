const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');
const keyCodes = require('../../utils/keycodes');
const nicknames = require('../chat_nicknames');
const dragDomElement = require('../../utils/drag-dom-element');

const VIEWER_CARD = '.chat-room__viewer-card';
const ROW_CONTAINER_SELECTOR = '.chat-room__viewer-card .viewer-card__actions';
const VIEWER_CARD_CLOSE = '.viewer-card__hide button';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_USERNAME_SELECTOR = '.chat-line__username';
const VIEWER_LIST_USERNAME_SELECTOR = '.chat-viewers-list__button';
const CHAT_INPUT_SELECTOR = '.chat-input textarea';

const BTTV_MOD_CARDS_ID = 'bttv-mod-cards';
const BTTV_MOD_CARDS_SELECTOR = `#${BTTV_MOD_CARDS_ID}`;
const BTTV_MOD_SECTION_ID = 'bttv-mod-section';
const BTTV_HIDE_SECTION_CLASS = 'bttv-hide-section';
const BTTV_USER_MESSAGES_ID = 'bttv-user-messages';

const BTTV_ACTION_CLASS = 'bttv-mod-action';
const BTTV_ACTION_SELECTOR = `.${BTTV_ACTION_CLASS}`;
const BTTV_ACTION_ATTR = 'bttv-action';
const BTTV_ACTION_VAL_ATTR = 'bttv-val';

const ACTIONS = {
    TIMEOUT: 'TIMEOUT',
    PERMIT: 'PERMIT',
    NICKNAME: 'NICKNAME',
    MESSAGES: 'MESSAGES'
};

const ACTIONS_MAP = {
    TIMEOUT: '/timeout',
    PERMIT: '!permit'
};

const buttonTextTemplate = text => `
    <button class="tw-button-icon bttv-font-size-10">
        <span class="tw-button__text">
            ${text}
        </span>
    </button>
`;

const buttonWrapperTemplate = (action, actionVal, tooltip, buttonTemplate) => `
    <div class="tw-tooltip-wrapper tw-inline-flex">
        <div class="${BTTV_ACTION_CLASS}"
            ${BTTV_ACTION_ATTR}="${action}"
            ${BTTV_ACTION_VAL_ATTR}="${actionVal || ''}"
        >
            ${buttonTemplate}
        </div>
        <div class="tw-tooltip tw-tooltip--up tw-tooltip--align-center">${tooltip}</div>
    </div>
`;

const textButton = (action, actionVal, tooltip, text) => `
    ${buttonWrapperTemplate(action, actionVal, tooltip, buttonTextTemplate(text))}
`;

const modCardTemplate = `
<div class="tw-c-background-alt-2 tw-full-width tw-flex" id="${BTTV_MOD_CARDS_ID}">
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row" id="${BTTV_MOD_SECTION_ID}">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.TIMEOUT, 1, 'Purge', '1s')}
            ${textButton(ACTIONS.TIMEOUT, 60, 'Timeout 1m', '1m')}
            ${textButton(ACTIONS.TIMEOUT, 600, 'Timeout 10m', '10m')}
            ${textButton(ACTIONS.TIMEOUT, 3600, 'Timeout 1hr', '1hr')}
            ${textButton(ACTIONS.TIMEOUT, 24 * 3600, 'Timeout 24hr', '24hr')}
            ${textButton(ACTIONS.PERMIT, null, '!permit User', '!permit')}
        </div>
    </div>
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.NICKNAME, null, 'Set Nickname', 'Nickname')}
            ${textButton(ACTIONS.MESSAGES, null, 'Show chat messages', 'Messages')}
        </div>
    </div>
    <div class="tw-inline-flex tw-flex-row ${BTTV_HIDE_SECTION_CLASS}" id="${BTTV_USER_MESSAGES_ID}">
        <div class="tw-pd-b-1 bttv-messages-scroll">
            <!-- messages -->
        </div>
    </div>
</div>`;

const INPUT_EVENT = new Event('input', { bubbles: true });
function setTextareaValue($inputField, msg) {
    $inputField.val(msg)[0].dispatchEvent(INPUT_EVENT);
}

function getUserMessages(userName) {
    return Array.from($(CHAT_LINE_SELECTOR))
        .reverse()
        .filter(el => {
            const messageObj = twitch.getChatMessageObject(el);
            if (!messageObj || !messageObj.user) return false;
            return messageObj.user.userLogin === userName;
        });
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
            .on('click.modCard_action', BTTV_ACTION_SELECTOR, e => this.onModActionClick(e))
            .on('keydown.modCard', e => this.onKeydown(e));
        this.targetUser = {};

        watcher.on('load.chat', () => {
            // allow the card to be moved out the chat.
            $(VIEWER_CARD).parent().removeClass('tw-relative');
        });
    }

    onViewerListClick(e) {
        const $target = $(e.currentTarget);
        const name = $target.attr('data-username');

        this.targetUser = {
            name: name,
            isOwner: name === twitch.getCurrentChannel().name,
            isMod: false // assume target user can be moderated.
        };
        this.onRenderModcards();
    }

    onUsernameClick(e) {
        const $target = $(e.currentTarget);
        const $line = $target.closest(CHAT_LINE_SELECTOR);
        const messageObj = twitch.getChatMessageObject($line[0]);
        this.targetUser = {
            name: messageObj.user.userLogin,
            isOwner: twitch.getUserIsOwnerFromTagsBadges(messageObj.badges),
            isMod: twitch.getUserIsModeratorFromTagsBadges(messageObj.badges)
        };
        this.onRenderModcards();
    }

    onRenderModcards() {
        const currentUser = twitch.getCurrentUser();
        const currentIsOwner = twitch.getCurrentUserIsOwner();
        const currentIsMod = twitch.getCurrentUserIsModerator();

        const targetIsNotStaff = !(this.targetUser.isOwner || this.targetUser.isMod);
        const canModTargetUser = currentIsOwner || (currentIsMod && targetIsNotStaff);

        clearInterval(this.renderInterval);
        if (currentUser.name === this.targetUser.name) {
            return $(BTTV_MOD_CARDS_SELECTOR).remove();
        }

        // initial load of a card requires to render asynchronously
        this.lazyRender(() => {
            $(`#${BTTV_MOD_SECTION_ID}`).toggleClass(BTTV_HIDE_SECTION_CLASS, !canModTargetUser);
            $(`#${BTTV_USER_MESSAGES_ID}`).toggleClass(BTTV_HIDE_SECTION_CLASS, true);
            dragDomElement($(VIEWER_CARD)[0], '.viewer-card');
        });
    }

    lazyRender(callback) {
        const currentRenderInterval = setInterval(() => {
            if (this.checkAndRender()) {
                clearInterval(currentRenderInterval);
                callback && callback();
            }
        }, 25);
        setTimeout(() => clearInterval(currentRenderInterval), 3000);
        this.renderInterval = currentRenderInterval;
    }

    checkAndRender() {
        if ($(BTTV_MOD_CARDS_SELECTOR).length) {
            return true;
        }
        $(modCardTemplate).appendTo(ROW_CONTAINER_SELECTOR);
        return $(BTTV_MOD_CARDS_SELECTOR).length > 0;
    }

    onModActionClick(e) {
        const $action = $(e.currentTarget);
        const action = $action.attr(BTTV_ACTION_ATTR);
        const actionCommand = ACTIONS_MAP[action];
        const actionVal = $action.attr(BTTV_ACTION_VAL_ATTR);
        if (!action || !this.targetUser.name) return;

        if (action === ACTIONS.NICKNAME) {
            return nicknames.set(this.targetUser.name);
        }
        if (action === ACTIONS.MESSAGES) {
            const $messages = $(`#${BTTV_USER_MESSAGES_ID}`);
            $messages.toggleClass(BTTV_HIDE_SECTION_CLASS);
            if (!$messages.hasClass(BTTV_HIDE_SECTION_CLASS)) {
                const userMessages = getUserMessages(this.targetUser.name);
                $messages
                    .children()
                    .html(userMessages.map(m => m.outerHTML).join(''));
            }
            return;
        }
        if (actionCommand) {
            twitch.sendChatMessage(`${actionCommand} ${this.targetUser.name} ${actionVal}`);
        }
    }

    close() {
        $(VIEWER_CARD_CLOSE).click();
    }

    isOpen() {
        return $(VIEWER_CARD_CLOSE).length > 0;
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
