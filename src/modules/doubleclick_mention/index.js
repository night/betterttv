const $ = require('jquery');
const watcher = require('../../watcher');
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
            const user = e.target.innerText.replace('@', '');
            const $inputField = $(CHAT_TEXT_AREA);
            const input = $inputField.val().trim();
            const output = input ? `${input} @${user} ` : `@${user}, `;
            $inputField.val(output).focus();
        });
    }
}

module.exports = new DoubleClickMentionModule();
