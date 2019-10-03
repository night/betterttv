const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const keyCodes = require('../../utils/keycodes');
const emotes = require('../emotes');

const CHAT_INPUT_SELECTOR = '.chat-input textarea';
const AUTOCOMPLETE_SUGGESTIONS_SELECTOR = 'div[data-a-target="autocomplete-balloon"]';

function normalizedStartsWith(word, prefix) {
    return word && word.toLowerCase().startsWith(prefix);
}

class ChatTabcompletionModule {
    constructor() {
        settings.add({
            id: 'tabCompletionTooltip',
            name: 'Completion Tooltip',
            defaultValue: true,
            description: 'Shows a tooltip with suggested names when using @ completion'
        });

        settings.add({
            id: 'tabCompletionEmotePriority',
            name: 'Tab Completion Emote Priority',
            description: 'Prioritize emotes over usernames when using tab completion',
            default: false,
        });

        watcher.on('chat.message', ($el, messageObj) => this.storeUser(messageObj));
        watcher.on('load.chat', () => this.resetChannelData());
        settings.on('changed.tabCompletionTooltip', () => this.loadTabCompletionTooltip());
        this.load();
    }

    loadTabCompletionTooltip() {
        $('body').toggleClass('bttv-hide-tab-completion-tooltip', !settings.get('tabCompletionTooltip'));
    }

    load() {
        this.tabTries = -1;
        this.suggestions = null;
        this.textSplit = ['', '', ''];
        this.userList = new Set();
        this.messageHistory = [];
        this.historyPos = -1;

        this.loadTabCompletionTooltip();
    }

    storeUser({user: {userDisplayName, userLogin}}) {
        const user = userDisplayName && userDisplayName.toLowerCase() === userLogin ? userDisplayName : userLogin;
        this.userList.add(user);
    }

    onSendMessage({message}) {
        if (message.trim().length === 0) return;
        this.messageHistory.unshift(message);
        this.historyPos = -1;
    }

    resetChannelData() {
        this.userList = new Set();
        $(CHAT_INPUT_SELECTOR).off('keydown.tabComplete focus.tabComplete')
            .on('keydown.tabComplete', e => this.onKeydown(e))
            .on('focus.tabComplete', () => this.onFocus());
    }

    onFocus() {
        this.tabTries = -1;
    }

    onKeydown(e, includeUsers = true) {
        const keyCode = e.keyCode || e.which;
        if (e.ctrlKey) return;

        const $inputField = $(e.target);
        if (keyCode === keyCodes.Tab) {
            e.preventDefault();

            // First time pressing tab, split before and after the word
            if (this.tabTries === -1) {
                const caretPos = $inputField[0].selectionStart;
                const text = $inputField.val();

                const start = (/[\:\(\)\w]+$/.exec(text.substr(0, caretPos)) || {index: caretPos}).index;
                const end = caretPos + (/^\w+/.exec(text.substr(caretPos)) || [''])[0].length;
                this.textSplit = [text.substring(0, start), text.substring(start, end), text.substring(end + 1)];

                // If there are no words in front of the caret, exit
                if (this.textSplit[1] === '') return;

                // Get all matching completions
                const includeEmotes = this.textSplit[0].slice(-1) !== '@';
                this.suggestions = this.getSuggestions(this.textSplit[1], includeUsers, includeEmotes);
            }

            if (settings.get('tabCompletionTooltip') && this.textSplit[0].slice(-1) === '@') {
                return;
            }

            if (this.suggestions.length > 0) {
                this.tabTries += e.shiftKey ? -1 : 1; // shift key iterates backwards
                if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
                if (this.tabTries < 0) this.tabTries = this.suggestions.length - 1;
                if (!this.suggestions[this.tabTries]) return;

                let cursorOffset = 0;
                if (this.textSplit[2].trim() === '') {
                    this.textSplit[2] = ' ';
                    cursorOffset = 1;
                }

                // prevent twitch's tab completion from preventing text replacement
                e.stopImmediatePropagation();

                const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length + cursorOffset;
                twitch.setInputValue($inputField, this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
                $inputField[0].setSelectionRange(cursorPos, cursorPos);
            }
        } else if (keyCode === keyCodes.Esc && this.tabTries >= 0) {
            twitch.setInputValue($inputField, this.textSplit.join(''));
        } else if (keyCode !== keyCodes.Shift) {
            this.tabTries = -1;
        }

        // Message history
        if (keyCode === keyCodes.UpArrow) {
            if ($(AUTOCOMPLETE_SUGGESTIONS_SELECTOR).length > 0) return;
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;

            const unsentMsg = $inputField.val().trim();
            if (this.historyPos < 0 && unsentMsg.length > 0) {
                this.messageHistory.unshift(unsentMsg);
                this.historyPos = 0;
            }

            const prevMsg = this.messageHistory[++this.historyPos];
            twitch.setInputValue($inputField, prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === keyCodes.DownArrow) {
            if ($(AUTOCOMPLETE_SUGGESTIONS_SELECTOR).length > 0) return;
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                twitch.setInputValue($inputField, prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                twitch.setInputValue($inputField, '');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }

    getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
        let userList = [];
        let emoteList = [];

        prefix = prefix.toLowerCase();

        if (includeEmotes) {
            const emoteSet = new Set();
            emotes.getEmotes()
                .forEach(({code}) => {
                    if (!normalizedStartsWith(code, prefix)) return;
                    emoteSet.add(code);
                });
            this.getTwitchEmotes()
                .forEach(code => {
                    if (!normalizedStartsWith(code, prefix)) return;
                    emoteSet.add(code);
                });
            emoteList = Array.from(emoteSet);
            emoteList.sort();
        }

        if (includeUsers) {
            userList = Array.from(this.userList).filter(word => normalizedStartsWith(word, prefix));
            userList.sort();
        }

        if (settings.get('tabCompletionEmotePriority') === true) {
            return [...emoteList, ...userList];
        } else {
            return [...userList, ...emoteList];
        }
    }

    getTwitchEmotes() {
        try {
            return Object.keys(twitch.getCurrentEmotes());
        } catch (_) {
            return [];
        }
    }
}


module.exports = new ChatTabcompletionModule();
