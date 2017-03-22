const $ = require('jquery');
const emotes = require('../emotes');
const keyCodes = require('../../utils/keycodes');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');

const CHAT_COMPONENT = '.ember-chat .chat-input';
const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';
const CHAT_SUGGESTIONS = '.ember-chat .chat-interface .suggestions';
const CONVERSATION_TEXT_AREA = '.conversation-window .chat-input textarea';

class TabCompletionModule {
    /*
    TODO:
        - priority ordering
        - settings for customizations
    */
    constructor() {
        settings.add({
            id: 'tabCompletionTooltip',
            name: 'Completion Tooltip',
            defaultValue: true,
            description: 'Shows a tooltip with suggested names when using @ completion'
        });

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

        if (settings.get('tabCompletionTooltip') === false) {
            this.hideSuggestions();
        }

        const $inputField = $(e.target);
        if (keyCode === keyCodes.Tab) {
            e.preventDefault();

            // First time pressing tab, split before and after the word
            if (this.tabTries === -1) {
                const caretPos = $inputField[0].selectionStart;
                const text = $inputField.val();

                const start = (/[\(\)\w]+$/.exec(text.substr(0, caretPos)) || {index: caretPos}).index;
                const end = caretPos + (/^\w+/.exec(text.substr(caretPos)) || [''])[0].length;
                this.textSplit = [text.substring(0, start), text.substring(start, end), text.substring(end + 1)];

                // If there are no words in front of the caret, exit
                if (this.textSplit[1] === '') return;

                // Get all matching completions
                const includeEmotes = this.textSplit[0].slice(-1) !== '@';
                this.suggestions = this.getSuggestions(this.textSplit[1], includeUsers, includeEmotes);
            }

            // Get all matching completions
            const atCompletion = this.textSplit[0].slice(-1) === '@';
            if (atCompletion && settings.get('tabCompletionTooltip')) {
                return;
            }

            if (this.suggestions.length > 0) {
                this.tabTries += e.shiftKey ? -1 : 1; // shift key iterates backwards
                if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
                if (this.tabTries < 0) this.tabTries = this.suggestions.length + this.tabTries;
                if (!this.suggestions[this.tabTries]) return;

                const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length;
                $inputField.val(this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
                $inputField[0].setSelectionRange(cursorPos, cursorPos);
            }
        } else if (keyCode === keyCodes.Esc && this.tabTries >= 0) {
            $inputField.val(this.textSplit.join(''));
        } else if (keyCode !== keyCodes.Shift) {
            this.tabTries = -1;
        }
    }

    getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
        const suggestions = [];

        if (includeEmotes) {
            // BTTV Emotes
            suggestions.push(...emotes.getEmotes().map(emote => emote.code));

            // Twitch emotes
            suggestions.push(...this.getTwitchEmotes().map(emote => emote.code));
        }

        if (includeUsers) {
            // Users
            suggestions.push(...this.userList);
        }

        // Filter and sort emotes
        return suggestions.filter(word => (
            word.toLowerCase().indexOf(prefix.toLowerCase()) === 0
        )).sort();
    }

    getTwitchEmotes() {
        const twitchEmotes = [];

        const tmiSession = twitch.getCurrentTMISession();
        if (tmiSession) {
            const emoteSets = tmiSession.getEmotes();
            if (emoteSets) {
                for (const set of Object.values(emoteSets.emoticon_sets)) {
                    twitchEmotes.push(...set);
                }
            }
        }

        return twitchEmotes;
    }

    hideSuggestions() {
        const $suggestions = $(CHAT_SUGGESTIONS);
        if ($suggestions.length) $suggestions.remove();
        const chatComponent = twitch.getEmberView($(CHAT_COMPONENT).attr('id'));
        if (chatComponent) chatComponent.closeSuggestions();
    }
}

module.exports = new TabCompletionModule();
