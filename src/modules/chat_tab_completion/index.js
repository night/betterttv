const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const keyCodes = require('../../utils/keycodes');
const emotes = require('../emotes');

const CHAT_INPUT_SELECTOR = '.chat-input textarea';
const AUTOCOMPLETE_SUGGESTIONS_SELECTOR = 'div[data-a-target="autocomplete-balloon"]';

function isSuggestionsShowing() {
    return $(AUTOCOMPLETE_SUGGESTIONS_SELECTOR).length > 0;
}

const INPUT_EVENT = new Event('input', { bubbles: true });
function setTextareaValue($inputField, msg) {
    $inputField.val(msg)[0].dispatchEvent(INPUT_EVENT);
}

class ChatTabcompletionModule {
    constructor() {
        settings.add({
            id: 'tabCompletionEmotePriority',
            name: 'Tab Completion Emote Priority',
            description: 'Prioritize emotes over usernames when using tab completion',
            default: false,
        });

        watcher.on('load.chat', () => this.load());
        watcher.on('chat.message', ($el, messageObj) => this.storeUser(messageObj.user));

        $('body')
            .on('keydown', CHAT_INPUT_SELECTOR, e => this.onKeydown(e))
            .on('focus', CHAT_INPUT_SELECTOR, () => this.onFocus());

        this.messageHistory = [];
    }

    load() {
        this.userList = new Set();
        this.tabTries = -1;
        this.suggestions = null;
        this.textSplit = ['', '', ''];
        this.historyPos = -1;
    }

    storeUser(user) {
        this.userList.add(user.userDisplayName || user.userLogin);
    }

    getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
        let userList = [];
        let emoteList = [];

        if (includeEmotes) {
            emoteList = emotes.getEmotes()
                .map(emote => emote.code)
                .concat(this.getTwitchEmotes())
                .filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            emoteList.sort();
        }

        if (includeUsers) {
            userList = this.getChatMembers().filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            userList.sort();
        }

        if (settings.get('tabCompletionEmotePriority') === true) {
            return [...emoteList, ...userList];
        } else {
            return [...userList, ...emoteList];
        }
    }

    onFocus() {
        this.tabTries = -1;
    }

    onKeydown(e, includeUsers = true) {
        const keyCode = e.keyCode || e.which;
        if (isSuggestionsShowing() || e.ctrlKey) {
            return;
        }
        const $inputField = $(e.target);
        this.onTabComplete(e, keyCode, $inputField, includeUsers);
        this.onChatHistory(e, keyCode, $inputField);
    }

    onTabComplete(e, keyCode, $inputField, includeUsers) {
        if (keyCode === keyCodes.Tab) {
            e.preventDefault();
            e.stopPropagation();

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

                const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length + cursorOffset;
                setTextareaValue($inputField, this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
                $inputField[0].setSelectionRange(cursorPos, cursorPos);
            }
        } else if (keyCode === keyCodes.Esc && this.tabTries >= 0) {
            e.preventDefault();
            e.stopPropagation();
            setTextareaValue($inputField, this.textSplit.join(''));
        } else if (keyCode !== keyCodes.Shift) {
            this.tabTries = -1;
        }
    }

    onChatHistory(e, keyCode, $inputField) {
        if (keyCode === keyCodes.UpArrow) {
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;
            e.preventDefault();
            e.stopPropagation();
            const prevMsg = this.messageHistory[++this.historyPos];
            setTextareaValue($inputField, prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === keyCodes.DownArrow) {
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            e.preventDefault();
            e.stopPropagation();
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                setTextareaValue($inputField, prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                setTextareaValue($inputField, '');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }

    getTwitchEmotes() {
        return Object.keys(twitch.getChatController().getCurrentEmotes());
    }

    getChatMembers() {
        const channel = twitch.getCurrentChannel();
        if (channel && channel.displayName) {
            this.userList.add(channel.displayName);
        }
        return Array.from(this.userList.values());
    }

    onSendMessage(msgObj) {
        const message = msgObj.message;
        if (message.trim().length === 0) return;
        this.messageHistory.unshift(message);
        this.historyPos = -1;
    }
}


module.exports = new ChatTabcompletionModule();
