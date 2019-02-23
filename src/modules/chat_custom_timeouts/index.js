const $ = require('jquery');
const watcher = require('../../watcher');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');

const CHAT_ROOM_SELECTOR = 'section[data-test-selector="chat-room-component-layout"]';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_USERNAME_SELECTOR = `${CHAT_LINE_SELECTOR} .chat-line__username`;
const CUSTOM_TIMEOUT_ID = 'bttv-custom-timeout-contain';
const CUSTOM_TIMEOUT_TEMPLATE = `
    <div id="${CUSTOM_TIMEOUT_ID}">
        <div class="text"></div>
        <svg class="back" width="83" height="224" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path fill-opacity=".304" fill="#000" fill-rule="nonzero" d="M1.5 1h80v20h-80zM1.5 181h80v20h-80zM2 203h80v20H2z"/>
            <text stroke="#8F8F8F" fill="#FFF" fill-rule="nonzero" font-family="Helvetica-Bold, Helvetica" font-size="16" font-weight="bold">
              <tspan x="26" y="16">Ban</tspan>
            </text>
            <path d="M81.5 20.805C65.51 52.825 71.65 155.184 1.5 181" fill-rule="nonzero" stroke-opacity=".3" stroke="#ACACAC"/>
            <text stroke="#8F8F8F" fill="#FFF" font-family="Helvetica-Bold, Helvetica" font-size="16" font-weight="bold">
              <tspan x="19" y="196">Purge</tspan>
            </text>
            <text stroke="#8F8F8F" fill="#FFF" font-family="Helvetica-Bold, Helvetica" font-size="16" font-weight="bold" transform="translate(1.5 1)">
              <tspan x="15.5" y="218">Delete</tspan>
            </text>
          </g>
        </svg>
        <div class="cursor"></div>
    </div>
`;
const ActionTypes = {
    CANCEL: 'cancel',
    TIMEOUT: 'timeout',
    BAN: 'ban',
    DELETE: 'delete'
};

let action;
let user;

function setReason(type) {
    const reason = prompt(`Enter ${type} reason: (leave blank for none)`);
    return reason || '';
}

function handleTimeoutClick(e, messageId) {
    const $customTimeout = $(`#${CUSTOM_TIMEOUT_ID}`);
    if (!$customTimeout.length || e.which === keyCodes.DOMVKCancel) return;

    if ($customTimeout.is(':hover')) {
        let command;
        let duration;
        if (action.type === ActionTypes.BAN) {
            command = '/ban';
        } else if (action.type === ActionTypes.TIMEOUT) {
            command = '/timeout';
            duration = action.length;
        } else if (action.type === ActionTypes.DELETE) {
            twitch.sendChatMessage(`/delete ${messageId}`);
        }
        if (command) {
            const reason = e.shiftKey ? setReason(action.type) : '';
            twitch.sendChatMessage(`${command} ${user}${duration ? ` ${duration}` : ''}${reason ? ` ${reason}` : ''}`);
        }
    }

    $customTimeout.remove();
}

function handleMouseMove(e) {
    const $customTimeout = $(`#${CUSTOM_TIMEOUT_ID}`);
    if (!$customTimeout.length) return;

    const offset = e.pageY - $customTimeout.offset().top;
    const offsetx = e.pageX - $customTimeout.offset().left;
    const amount = 224 - offset;
    const time = Math.floor(Math.pow(1.5, (amount - 20) / 7) * 60);

    let humanTime;
    if (Math.floor(time / 60 / 60 / 24) > 0) {
        humanTime = `${Math.floor(time / 60 / 60 / 24)} Days`;
    } else if (Math.floor(time / 60 / 60) > 0) {
        humanTime = `${Math.floor(time / 60 / 60)} Hours`;
    } else {
        humanTime = `${Math.floor(time / 60)} Minutes`;
    }

    if (amount > 224 || amount < 0 || offsetx > 83 || offsetx < 0) {
        action = {
            type: ActionTypes.CANCEL,
            length: 0,
            text: 'CANCEL'
        };
    } else if (amount > 24 && amount < 200) {
        action = {
            type: ActionTypes.TIMEOUT,
            length: time,
            text: humanTime
        };
    } else if (amount >= 200 && amount < 224) {
        action = {
            type: ActionTypes.BAN,
            length: 0,
            text: 'BAN'
        };
    } else if (amount > 0 && amount <= 24) {
        action = {
            type: ActionTypes.DELETE,
            length: 0,
            text: 'DELETE'
        };
    }

    $customTimeout.find('.text').text(action.text);
    $customTimeout.find('.cursor').css('top', offset);
}

function openCustomTimeout($target, messageId) {
    if ($(`#${CUSTOM_TIMEOUT_ID}`).length) return;

    const $chat = $(CHAT_ROOM_SELECTOR);
    $chat.append(CUSTOM_TIMEOUT_TEMPLATE);

    const $customTimeout = $(`#${CUSTOM_TIMEOUT_ID}`);

    $customTimeout.css({
        top: $target.offset().top + ($target.height() / 2) - ($customTimeout.height() / 2),
        left: $chat.offset().left - $customTimeout.width() + $chat.width() - 20
    });

    action = {
        type: ActionTypes.CANCEL,
        length: 0,
        text: 'CANCEL'
    };

    $customTimeout.on('mousemove', handleMouseMove);
    $customTimeout.on('mousedown', e => handleTimeoutClick(e, messageId));
}

function handleClick(e) {
    if (!twitch.getCurrentUserIsModerator()) return;
    e.preventDefault();

    const $chatLine = $(e.currentTarget).closest(CHAT_LINE_SELECTOR);
    const msgObject = twitch.getChatMessageObject($chatLine[0]);
    if (!msgObject) return;
    user = msgObject.user.userLogin;
    openCustomTimeout($(e.currentTarget), msgObject.id);
}

class ChatCustomTimeoutsModule {
    constructor() {
        watcher.on('load.chat', () => this.loadClickHandler());
    }

    loadClickHandler() {
        $(CHAT_ROOM_SELECTOR)
            .off('contextmenu', CHAT_LINE_USERNAME_SELECTOR, handleClick)
            .on('contextmenu', CHAT_LINE_USERNAME_SELECTOR, handleClick)
            .off('click', handleTimeoutClick)
            .on('click', handleTimeoutClick);
    }
}

module.exports = new ChatCustomTimeoutsModule();
