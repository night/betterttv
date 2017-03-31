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
            console.log(e.target);
            clearSelection();
            chatModerationCards.close();
            const username = e.target.innerText;
            const $inputField = $(CHAT_TEXT_AREA);
            const inputContent = $inputField.val().trim();
            $inputField.val(`${inputContent} @${username}`.trim());
            $inputField.focus();
        });
    }
}

module.exports = new DoubleClickMentionModule();
