const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const chatModerationCards = require('../chat_moderator_cards');

const CHAT_ROOM_SELECTOR = '.chat-room';
const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';
const USERNAME_SELECTORS = '.chat-line span.from, .chat-line .mentioning, .chat-line .mentioned';

function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

class DoubleClickMentionModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $(CHAT_ROOM_SELECTOR).on('dblclick', USERNAME_SELECTORS, e => {
            if (e.shiftKey || e.ctrlKey) return;
            clearSelection();
            chatModerationCards.close();
            let user = e.target.innerText.replace('@', '');
            const $target = $(e.target);
            const messageObj = twitch.getChatMessageObject($target.closest('.chat-line')[0]);
            if (messageObj && !$target.hasClass('mentioning') && !$target.hasClass('mentioned')) {
                user = messageObj.from;
            }
            const $inputField = $(CHAT_TEXT_AREA);
            if (!$inputField.length) return;
            const input = $inputField.val().trim();
            const output = input ? `${input} @${user} ` : `@${user}, `;
            $inputField.val(output).focus();
        });
    }
}

module.exports = new DoubleClickMentionModule();
