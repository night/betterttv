const $ = require('jquery');
const keyCodes = require('../../utils/keycodes');
const emotes = require('../emotes');
const watcher = require('../../watcher');

const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';
const CONVERSATION_TEXT_AREA = '.conversation-window .chat-input textarea';
const CHAT_SUGGESTIONS = '.ember-chat .chat-interface .suggestions';

class TabCompletionModule {
    /*
    TODO:
        - priority ordering
        - suggestions popout
        - settings for customizations
    */
    constructor() {
        this.load();
        watcher.on('chat.message', ($el, msg) => this.storeUser($el, msg));
        watcher.on('load.chat', () => this.resetChannelData());
    }

    load() {
        this.tabTries = -1;
        this.suggestions = null;
        this.textSplit = ['', '', ''];
        this.userList = new Set();

        $('body').on('click focus', CHAT_TEXT_AREA, this.onFocus)
                 .on('click focus', CONVERSATION_TEXT_AREA, this.onFocus)
                 .on('keydown', CHAT_TEXT_AREA, e => this.onKeyDown(e))
                 .on('keydown', CONVERSATION_TEXT_AREA, e => this.onKeyDown(e, false));
    }

    storeUser($el, msg) {
        if (!msg || !msg.from) return;

        const displayName = msg.tags && msg.tags['display-name'];
        if (displayName && msg.from === displayName.toLowerCase()) {
            this.userList.add(displayName);
        } else {
            this.userList.add(msg.from);
        }
    }

    resetChannelData() {
        this.userList = new Set();
    }

    onFocus() {
        this.tabTries = -1;
    }

    onKeyDown(e, includeUsers) {
        const keyCode = e.keyCode || e.which;
        if (e.ctrlKey) return;

        const $inputField = $(e.target);
        const $suggestions = $(CHAT_SUGGESTIONS);
        if ($suggestions.length) $suggestions.remove();

        if (keyCode === keyCodes.Tab) {
            e.preventDefault();

            // First time pressing tab, split before and after the word
            if (this.tabTries === -1) {
                const caretPos = $inputField[0].selectionStart;
                const text = $inputField.val();

                const start = (/[@\w]+$/.exec(text.substr(0, caretPos)) || {index: caretPos}).index;
                const end = caretPos + (/^\w+/.exec(text.substr(caretPos)) || [''])[0].length;
                this.textSplit = [text.substring(0, start), text.substring(start, end), text.substring(end + 1)];

                // If there are no words in front of the caret, exit
                if (this.textSplit[1] === '') return;

                // Get all matching completions
                this.suggestions = this.getSuggestions(this.textSplit[1], includeUsers);
            }

            if (this.suggestions.length > 0) {
                this.tabTries += e.shiftKey ? -1 : 1; // shift key iterates backwards
                if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
                if (this.tabTries < 0) this.tabTries = this.suggestions.length + this.tabTries;
                $inputField.val(this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);

                const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length;
                $inputField[0].setSelectionRange(cursorPos, cursorPos);
            }
        } else if (keyCode === keyCodes.Esc && this.tabTries >= 0) {
            $inputField.val(this.textSplit.join(''));
        } else if (keyCode !== keyCodes.Shift) {
            this.tabTries = -1;
        }
    }

    getSuggestions(prefix, includeUsers = true) {
        const suggestions = emotes.getEmotes().map(emote => emote.code);  // Emotes
        if (includeUsers === true) suggestions.push(...this.userList);    // Users
        return suggestions.filter(word => (
            word.toLowerCase().indexOf(prefix.toLowerCase()) === 0
        )).sort();
    }
}

module.exports = new TabCompletionModule();
