const $ = require('jquery');
const chatModerationCards = require('../chat_moderator_cards');

const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';

function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}

class DoubleClickMentionModule {
    constructor() {
        $('body').on('dblclick', '.chat-line span.from', e => {
            if (e.shiftKey || e.ctrlKey) return;
            clearSelection();
            chatModerationCards.close();
            const user = e.target.innerText;
            const $inputField = $(CHAT_TEXT_AREA);
            const input = $inputField.val().trim();
            const output = input ? `${input} @${user} ` : `@${user}, `;
            $inputField.val(output).focus();
        });
    }
}

module.exports = new DoubleClickMentionModule();
