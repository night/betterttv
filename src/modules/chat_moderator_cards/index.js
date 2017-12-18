const $ = require('jquery');
const moment = require('moment');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');
const keyCodes = require('../../utils/keycodes');
const nicknames = require('../chat_nicknames');

const ROW_CONTAINER_SELECTOR = '.chat-room__viewer-card .viewer-card__actions';
const VIEWER_CARD_CLOSE = '.viewer-card__hide button';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_USERNAME_SELECTOR = '.chat-line__username';
const VIEWER_LIST_USERNAME_SELECTOR = '.chat-viewers-list__button';
const MENTION_SELECTOR = '.chat-line__message [data-a-target="chat-message-mention"]';
const CHAT_INPUT_SELECTOR = '.chat-input textarea';

const BTTV_MOD_CARDS_ID = 'bttv-mod-cards';
const BTTV_MOD_CARDS_SELECTOR = `#${BTTV_MOD_CARDS_ID}`;
const BTTV_MOD_SECTION_CLASS = 'bttv-mod-section';
const BTTV_OWNER_SECTION_CLASS = 'bttv-owner-section';
const BTTV_HIDE_SECTION_CLASS = 'bttv-hide-section';
const BTTV_USER_MESSAGES_ID = 'bttv-user-messages';

const BTTV_ACTION_CLASS = 'bttv-mod-action';
const BTTV_ACTION_SELECTOR = `.${BTTV_ACTION_CLASS}`;
const BTTV_ACTION_ATTR = 'bttv-action';
const BTTV_ACTION_VAL_ATTR = 'bttv-val';

const ACTIONS = {
    BAN: 'BAN',
    UNBAN: 'UNBAN',
    MOD: 'MOD',
    UNMOD: 'UNMOD',
    TIMEOUT: 'TIMEOUT',
    PERMIT: 'PERMIT',
    MESSAGES: 'MESSAGES'
};

const ACTIONS_MAP = {
    BAN: '/ban',
    UNBAN: '/unban',
    MOD: '/mod',
    UNMOD: '/unmod',
    TIMEOUT: '/timeout',
    PERMIT: '!permit'
};

const svgCheck = '<figure class="tw-svg"><svg class="tw-svg__asset tw-svg__asset--followcheck tw-svg__asset--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path clip-rule="evenodd" d="M6.5,12.75L2,8.25l2-2l2.5,2.5l5.5-5.5l2,2L6.5,12.75z" fill-rule="evenodd"></path></svg></figure>';
const svgBlock = '<figure class="tw-svg"><svg class="tw-svg__asset tw-svg__asset--ban tw-svg__asset--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path clip-rule="evenodd" d="M8,15c-3.866,0-7-3.134-7-7s3.134-7,7-7s7,3.134,7,7S11.866,15,8,15z M3,8c0,1.019,0.309,1.964,0.832,2.754l6.922-6.922C9.964,3.309,9.019,3,8,3C5.238,3,3,5.238,3,8z M12.169,5.246l-6.923,6.923C6.036,12.691,6.98,13,8,13c2.762,0,5-2.238,5-5C13,6.98,12.691,6.036,12.169,5.246z" fill-rule="evenodd"></path></svg></figure>';
const svgHeart = '<figure class="tw-svg"><svg class="tw-svg__asset tw-svg__asset--heart tw-svg__asset--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path clip-rule="evenodd" d="M8,14L1,7V4l2-2h3l2,2l2-2h3l2,2v3L8,14z" fill-rule="evenodd"></path></svg></figure>';
const svgEye = '<figure class="tw-svg"><svg class="tw-svg__asset tw-svg__asset--glyphviews tw-svg__asset--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path clip-rule="evenodd" d="M11,13H5L1,9V8V7l4-4h6l4,4v1v1L11,13z M8,5C6.344,5,5,6.343,5,8c0,1.656,1.344,3,3,3c1.657,0,3-1.344,3-3C11,6.343,9.657,5,8,5z M8,9C7.447,9,7,8.552,7,8s0.447-1,1-1s1,0.448,1,1S8.553,9,8,9z" fill-rule="evenodd"></path></svg></figure>';
const svgPen = '<figure class="tw-svg"><svg class="tw-svg__asset tw-svg__asset--edit tw-svg__asset--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path clip-rule="evenodd" d="M6.414,12.414L3.586,9.586l8-8l2.828,2.828L6.414,12.414z M4.829,14H2l0,0v-2.828l0.586-0.586l2.828,2.828L4.829,14z" fill-rule="evenodd"></path></svg></figure>';

const buttonTextTemplate = text => `
    <button class="tw-button-icon bttv-font-size-1">
        <span class="tw-button__text">
            ${text}
        </span>
    </button>
`;

const buttonIconTemplate = svg => `
    <button class="tw-button-icon">
        <span class="tw-button-icon__icon">
            ${svg}
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

const iconButton = (action, actionVal, tooltip, iconSvg) => `
    ${buttonWrapperTemplate(action, actionVal, tooltip, buttonIconTemplate(iconSvg))}
`;

const modCardsTemplate = `
<div class="tw-c-background-alt-2 tw-full-width tw-flex" id="${BTTV_MOD_CARDS_ID}">
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row ${BTTV_MOD_SECTION_CLASS}">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.TIMEOUT, 1, 'Purge', '1s')}
            ${textButton(ACTIONS.TIMEOUT, 60, 'Timeout 1m', '1m')}
            ${textButton(ACTIONS.TIMEOUT, 600, 'Timeout 10m', '10m')}
            ${textButton(ACTIONS.TIMEOUT, 3600, 'Timeout 1hr', '1h')}
            ${textButton(ACTIONS.TIMEOUT, 8 * 3600, 'Timeout 8hr', '8h')}
            ${textButton(ACTIONS.TIMEOUT, 24 * 3600, 'Timeout 24hr', '24h')}
            ${textButton(ACTIONS.PERMIT, null, '!permit User', '!permit')}
        </div>
    </div>
    <div class="tw-c-background-alt-2 tw-full-width tw-flex ${BTTV_MOD_SECTION_CLASS}">
        <div class="tw-pd-l-1 tw-inline-flex tw-flex-row">
            <div class="tw-inline-flex">
                ${iconButton(ACTIONS.UNBAN, null, 'Unban/Untimeout User', svgCheck)}
                ${iconButton(ACTIONS.BAN, null, 'Ban User', svgBlock)}
            </div>
            <div class="tw-inline-flex ${BTTV_OWNER_SECTION_CLASS}">
                ${textButton(ACTIONS.MOD, null, 'Mod User', 'Mod')}
                ${textButton(ACTIONS.UNMOD, null, 'Unmod User', 'Unmod')}
            </div>
        </div>
    </div>
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.MESSAGES, null, 'Show chat messages', 'Chat Messages')}
        </div>
    </div>
    <div class="tw-inline-flex tw-flex-row" id="${BTTV_USER_MESSAGES_ID}">
        <div class="tw-pd-b-1 bttv-messages-scroll">
            <!-- messages -->
        </div>
    </div>
</div>`;

const viewStatTemplate = `
<div class="tw-flex tw-full-width tw-pd-l-1 bttv-stats">
    <div class="tw-stat tw-pd-l-1">
        <span class="tw-stat__icon">${svgEye}</span>
        <span class="tw-stat__value bttv-views-value"><!-- VIEWS  --></span>
    </div>
    <div class="tw-stat tw-pd-l-1">
        <span class="tw-stat__icon">${svgHeart}</span>
        <span class="tw-stat__value bttv-follows-value"><!-- FOLLOWERS  --></span>
    </div>
</div>
`;

const createdTemplate = `
    <div class="tw-pd-b-1 bttv-created-at"></div>
`;

const nicknameButtonTemplate = `
<button class="tw-button-icon tw-button-icon--overlay tw-mg-l-1 bttv-nickname-button">
    <span class="tw-button-icon__icon">${svgPen}</span>
</button>
`;


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
            .on('click.modCard_action', BTTV_ACTION_SELECTOR, e => this.onModActionClick(e))
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
        const currentUser = twitch.getCurrentUser();
        const currentIsOwner = twitch.getCurrentUserIsOwner();
        const currentIsMod = twitch.getCurrentUserIsModerator();

        const targetIsNotStaff = !(this.targetUser.isOwner || this.targetUser.isMod);
        const targetIsCurrent = currentUser.name === this.targetUser.name;
        const canModTargetUser = !targetIsCurrent && (currentIsOwner || (currentIsMod && targetIsNotStaff));

        clearInterval(this.renderInterval);
        // initial load of a card requires to render asynchronously
        this.lazyRender(() => {
            this.renderModCards(currentIsOwner, canModTargetUser);
            this.renderNicknameButton();
            this.renderStats();
            this.renderCreatedDate();
        });
    }

    renderModCards(currentIsOwner, canModTargetUser) {
        let $modCards = $(BTTV_MOD_CARDS_SELECTOR);
        if ($modCards.length === 0) {
            $(ROW_CONTAINER_SELECTOR).children().last().remove(); // remove twitch mod cards.
            $modCards = $(modCardsTemplate);
            $modCards.appendTo(ROW_CONTAINER_SELECTOR);
        }

        $(`.${BTTV_OWNER_SECTION_CLASS}`).toggleClass(BTTV_HIDE_SECTION_CLASS, !currentIsOwner);
        $(`.${BTTV_MOD_SECTION_CLASS}`).toggleClass(BTTV_HIDE_SECTION_CLASS, !canModTargetUser);
        $(`#${BTTV_USER_MESSAGES_ID}`).toggleClass(BTTV_HIDE_SECTION_CLASS, true);
    }

    renderNicknameButton() {
        const $name = $('.viewer-card__display-name').children().first();
        let $el = $name.find('.bttv-nickname-button');
        if ($el.length === 0) {
            $el = $(nicknameButtonTemplate);
            $el.appendTo($name);
            $el.on('click', () => {
                if (!this.targetUser || !this.targetUser.name) return;
                nicknames.set(this.targetUser.name);
            });
        }
    }

    renderCreatedDate() {
        let $el = $('.viewer-card__display-name').find('.bttv-created-at');
        if ($el.length === 0) {
            $el = $(createdTemplate);
            $el.appendTo('.viewer-card__display-name');
        }
        $el.text('Loading...');
        this.targetUser.dataPromise.then(data => {
            $el.text(`Created ${moment(data.created_at).format('MMM D, YYYY')}`);
        });
    }

    renderStats() {
        let $stats = $('.viewer-card__display-name').find('.bttv-stats');
        if ($stats.length === 0) {
            $stats = $(viewStatTemplate);
            $stats.appendTo('.viewer-card__display-name');
        }
        $stats.find('.bttv-views-value').text('0');
        $stats.find('.bttv-follows-value').text('0');

        this.targetUser.dataPromise.then(data => {
            $stats.find('.bttv-views-value').text(data.views.toLocaleString());
            $stats.find('.bttv-follows-value').text(data.followers.toLocaleString());
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
        const action = $action.attr(BTTV_ACTION_ATTR);
        const actionCommand = ACTIONS_MAP[action];
        const actionVal = $action.attr(BTTV_ACTION_VAL_ATTR);
        if (!action || !this.targetUser.name) return;

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
