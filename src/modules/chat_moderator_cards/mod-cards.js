const moment = require('moment');
const nicknames = require('../chat_nicknames');
const twitch = require('../../utils/twitch');

const ACTIONS = {
    BAN: {id: 'BAN', action: '/ban'},
    UNBAN: {id: 'UNBAN', action: '/unban'},
    MOD: {id: 'MOD', action: '/mod'},
    UNMOD: {id: 'UNMOD', action: '/unmod'},
    TIMEOUT: {id: 'TIMEOUT', action: '/timeout'},
    PERMIT: {id: 'PERMIT', action: '!permit'},
    MESSAGES: {id: 'MESSAGES', action: ''}
};

const ACTION_CONTAINER_SELECTOR = '.chat-room__viewer-card .viewer-card__actions';

const BTTV_MOD_CARDS_CLASS = 'bttv-mod-cards';
const BTTV_MOD_SECTION_CLASS = 'bttv-mod-section';
const BTTV_HIDE_SECTION_CLASS = 'bttv-hide-section';
const BTTV_OWNER_SECTION_CLASS = 'bttv-owner-section';
const BTTV_USER_MESSAGES_ID = 'bttv-user-messages';

const BTTV_ACTION_CLASS = 'bttv-mod-action';
const BTTV_ACTION_ATTR = 'bttv-action';
const BTTV_ACTION_VAL_ATTR = 'bttv-val';

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

const MOD_ACTIONS_TEMPLATE = `
<div class="tw-c-background-alt-2 tw-full-width tw-flex ${BTTV_MOD_CARDS_CLASS}">
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row ${BTTV_MOD_SECTION_CLASS}">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.TIMEOUT.id, 1, 'Purge', '1s')}
            ${textButton(ACTIONS.TIMEOUT.id, 60, 'Timeout 1m', '1m')}
            ${textButton(ACTIONS.TIMEOUT.id, 600, 'Timeout 10m', '10m')}
            ${textButton(ACTIONS.TIMEOUT.id, 3600, 'Timeout 1hr', '1h')}
            ${textButton(ACTIONS.TIMEOUT.id, 8 * 3600, 'Timeout 8hr', '8h')}
            ${textButton(ACTIONS.TIMEOUT.id, 24 * 3600, 'Timeout 24hr', '24h')}
            ${textButton(ACTIONS.PERMIT.id, null, '!permit User', '!permit')}
        </div>
    </div>
    <div class="tw-c-background-alt-2 tw-full-width tw-flex ${BTTV_MOD_SECTION_CLASS}">
        <div class="tw-pd-l-1 tw-inline-flex tw-flex-row">
            <div class="tw-inline-flex">
                ${iconButton(ACTIONS.UNBAN.id, null, 'Unban User', svgCheck)}
                ${iconButton(ACTIONS.BAN.id, null, 'Ban User', svgBlock)}
            </div>
            <div class="tw-inline-flex ${BTTV_OWNER_SECTION_CLASS}">
                ${textButton(ACTIONS.MOD.id, null, 'Mod User', 'Mod')}
                ${textButton(ACTIONS.UNMOD.id, null, 'Unmod User', 'Unmod')}
            </div>
        </div>
    </div>
    <div class="tw-pd-l-1 tw-inline-flex tw-flex-row">
        <div class="tw-inline-flex">
            ${textButton(ACTIONS.MESSAGES.id, null, 'Show chat messages', 'Chat Messages')}
        </div>
    </div>
    <div class="tw-inline-flex tw-flex-row" id="${BTTV_USER_MESSAGES_ID}">
        <div class="tw-pd-b-1 bttv-messages-scroll">
            <!-- messages -->
        </div>
    </div>
</div>`;

const STATS_TEMPLATE = `
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

const CREATED_TEMPLATE = `
    <div class="tw-pd-b-1 bttv-created-date"></div>
`;

const NICKNAME_BUTTON_TEMPLATE = `
<button class="tw-button-icon tw-button-icon--overlay tw-mg-l-1 bttv-nickname-button">
    <span class="tw-button-icon__icon">${svgPen}</span>
</button>
`;

function renderModCards(targetUser) {
    const currentUser = twitch.getCurrentUser();
    const currentUserIsOwner = twitch.getCurrentUserIsOwner();
    const currentIsMod = twitch.getCurrentUserIsModerator();

    const targetIsNotStaff = !(targetUser.isOwner || targetUser.isMod);
    const targetIsCurrent = currentUser.name === targetUser.name;
    const userCanModTarget = !targetIsCurrent && (currentUserIsOwner || (currentIsMod && targetIsNotStaff));

    let $modCards = $(`.${BTTV_MOD_CARDS_CLASS}`);
    if ($modCards.length === 0) {
        $(ACTION_CONTAINER_SELECTOR).children().last().remove(); // remove twitch mod cards.
        $modCards = $(MOD_ACTIONS_TEMPLATE);
        $modCards.appendTo(ACTION_CONTAINER_SELECTOR);
    }

    $(`.${BTTV_OWNER_SECTION_CLASS}`).toggleClass(BTTV_HIDE_SECTION_CLASS, !currentUserIsOwner);
    $(`.${BTTV_MOD_SECTION_CLASS}`).toggleClass(BTTV_HIDE_SECTION_CLASS, !userCanModTarget);
    $(`#${BTTV_USER_MESSAGES_ID}`).toggleClass(BTTV_HIDE_SECTION_CLASS, true);
}

function renderNicknameButton(targetUser) {
    const $name = $('.viewer-card__display-name').children().first();
    let $el = $name.find('.bttv-nickname-button');
    if ($el.length === 0) {
        $el = $(NICKNAME_BUTTON_TEMPLATE);
        $el.appendTo($name);
        $el.on('click', () => {
            if (!targetUser.name) return;
            nicknames.set(targetUser.name);
        });
    }
}

function renderCreatedDate(targetUser) {
    let $el = $('.viewer-card__display-name').find('.bttv-created-date');
    if ($el.length === 0) {
        $el = $(CREATED_TEMPLATE);
        $el.appendTo('.viewer-card__display-name');
    }
    $el.text('Loading...');
    targetUser.dataPromise.then(data => {
        $el.text(`Created ${moment(data.created_at).format('MMM D, YYYY')}`);
    });
}

function renderStats(targetUser) {
    let $stats = $('.viewer-card__display-name').find('.bttv-stats');
    if ($stats.length === 0) {
        $stats = $(STATS_TEMPLATE);
        $stats.appendTo('.viewer-card__display-name');
    }
    $stats.find('.bttv-views-value').text('0');
    $stats.find('.bttv-follows-value').text('0');

    targetUser.dataPromise.then(data => {
        $stats.find('.bttv-views-value').text(data.views.toLocaleString());
        $stats.find('.bttv-follows-value').text(data.followers.toLocaleString());
    });
}

function render(targetUser) {
    if (!targetUser) return;
    renderModCards(targetUser);
    renderNicknameButton(targetUser);
    renderStats(targetUser);
    renderCreatedDate(targetUser);
}

function getUserMessages(userName) {
    return Array.from($('.chat-line__message'))
        .reverse()
        .filter(el => {
            const messageObj = twitch.getChatMessageObject(el);
            if (!messageObj || !messageObj.user) return false;
            return messageObj.user.userLogin === userName;
        });
}

function renderUserChatMessages(userName) {
    const $messages = $(`#${BTTV_USER_MESSAGES_ID}`);
    $messages.toggleClass(BTTV_HIDE_SECTION_CLASS);
    if (!$messages.hasClass(BTTV_HIDE_SECTION_CLASS)) {
        const userMessages = getUserMessages(userName);
        $messages
            .children()
            .html(userMessages.map(m => m.outerHTML).join(''));
    }
}

module.exports = {
    render,
    renderUserChatMessages,
    ACTIONS,
    BTTV_ACTION_SELECTOR: `.${BTTV_ACTION_CLASS}`,
    BTTV_ACTION_ATTR,
    BTTV_ACTION_VAL_ATTR,
    BTTV_HIDE_SECTION_CLASS
};
