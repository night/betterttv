const $ = require('jquery');
const watcher = require('../../watcher');
const emotes = require('../emotes');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const settings = require('../../settings');

const ORIGINAL_TEXTAREA = '.chat-input textarea';
const CHAT_TEXTAREA = '#bttv-chat-input';

// Replaces Twitch Text Input with our own
function newTextArea() {
    const text = document.createElement('textarea');
    const $oldText = $(ORIGINAL_TEXTAREA);
    $oldText[0].before(text);
    const $text = $(text);

    Array.from($oldText[0].attributes)
        .map(attrEl => attrEl.name)
        .forEach(attr => {
            const v = $oldText.attr(attr);
            $text.attr(attr, v);
        });
    $text.attr('id', 'bttv-chat-input');
    $oldText.attr('id', 'twitch-chat-input');
    $oldText.hide();
    return { $text, $oldText};
}

class CustomInputModule {
    constructor() {
        settings.add({
            id: 'tabCompletionEmotePriority',
            name: 'Tab Completion Emote Priority',
            description: 'Prioritize emotes over usernames when using tab completion',
            default: false,
        });

        this.load();
        watcher.on('load.chat', () => this.onChatLoad());
    }

    sendMessage() {
        const message = this.$text.val();
        if (message.trim().length === 0) {
            return;
        }
        this.chatInputCtrl.props.onSendMessage(message);
        this.$text.val('');
        this.messageHistory.unshift(message);
        this.historyPos = -1;
    }

    onChatLoad() {
        this.chatInputCtrl = twitch.getChatInputController();
        const { $text, $oldText } = newTextArea();
        this.$text = $text;
        this.$oldText = $oldText;
    }

    enable() {
        this.$text.show();
        this.$oldText.hide();
        this.isEnabled = true;
    }

    disable() {
        this.$text.hide();
        this.$oldText.show();
        this.isEnabled = false;
    }

    load() {
        this.tabTries = -1;
        this.suggestions = null;
        this.textSplit = ['', '', ''];
        this.messageHistory = [];
        this.historyPos = -1;

        $('body').off('click.tabComplete focus.tabComplete keydown.tabComplete')
            .on('click.tabComplete focus.tabComplete', CHAT_TEXTAREA, () => this.onFocus())
            .on('keydown.tabComplete', CHAT_TEXTAREA, e => this.onKeyDown(e));
    }

    getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
        let userList = [];
        let emoteList = [];

        if (includeEmotes) {
            emoteList = emotes.getEmotes().map(emote => emote.code);
            emoteList.push(...this.getTwitchEmotes());
            emoteList = emoteList.filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            emoteList = Array.from(new Set(emoteList).values());
            emoteList.sort();
        }

        if (includeUsers) {
            userList = this.getChatMembers().filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            userList.sort();
        }

        if (settings.get('tabCompletionEmotePriority') === true) {
            return [ ...emoteList, ...userList];
        } else {
            return [...userList, ...emoteList];
        }
    }

    onKeyDown(e, includeUsers) {
        if (!this.isEnabled) return;
        const keyCode = e.keyCode || e.which;
        if (e.ctrlKey) {
            return;
        }
        const $inputField = this.$text;

        if (keyCode === keyCodes.Enter && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        } else if (keyCode === keyCodes.Tab) {
            e.preventDefault();
            this.onAutoComplete(includeUsers, e.shiftKey);
        } else if (keyCode === keyCodes.Escape && this.tabTries >= 0) {
            $inputField.val(this.textSplit.join(''));
        } else if (keyCode !== keyCodes.Shift) {
            this.tabTries = -1;
        }

        // Message history
        if (keyCode === keyCodes.UpArrow) {
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;
            const prevMsg = this.messageHistory[++this.historyPos];
            $inputField.val(prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === keyCodes.DownArrow) {
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                $inputField.val(prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                $inputField.val('');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }

    onFocus() {
        this.tabTries = -1;
    }

    onAutoComplete(includeUsers, shiftKey) {
        const $inputField = this.$text;

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
            this.tabTries += shiftKey ? -1 : 1; // shift key iterates backwards
            if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
            if (this.tabTries < 0) this.tabTries = this.suggestions.length - 1;
            if (!this.suggestions[this.tabTries]) return;

            let cursorOffset = 0;
            if (this.textSplit[2].trim() === '') {
                this.textSplit[2] = ' ';
                cursorOffset = 1;
            }

            const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length + cursorOffset;
            $inputField.val(this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
            $inputField[0].setSelectionRange(cursorPos, cursorPos);
        }
    }

    getTwitchEmotes() {
        const twEmotes = this.chatInputCtrl.props.emotes;
        if (!twEmotes) {
            return [];
        }
        return twEmotes
            .reduce((accum, v) => accum.concat(v.emotes), [])
            .map(emote => emote.displayName);
    }

    getChatMembers() {
        let chatMembers = this.chatInputCtrl.props.chatMembers;
        const broadcasterName = this.chatInputCtrl.props.channelDisplayName;
        if (!chatMembers) {
            return [];
        }
        chatMembers = chatMembers
            .map(v => v.userDisplayName);
        if (!chatMembers.find(v => v === broadcasterName)) {
            chatMembers.push(broadcasterName);
        }
        return chatMembers;
    }
}

module.exports = CustomInputModule;
