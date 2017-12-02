const watcher = require('../../watcher');
const settings = require('../../settings');

const CustomInputModule = require('./custom-input-module');
const InputPatcherModule = require('./input-patcher-module');
const ChatHistoryModule = require('./chat-history-module');

const CHAT_INPUT = '.chat-input';

class ChatAutocompletionModule {
    constructor() {
        settings.add({
            id: 'tabAutocomplete',
            name: 'Tab Based Autocompletion',
            defaultValue: false,
            description: 'Autocomplete with Tab key'
        });

        this.customInput = new CustomInputModule(message => {
            this.chatHistory.onSendMessage(message);
        });
        this.patchedInput = new InputPatcherModule();
        this.chatHistory = new ChatHistoryModule();
        this.currentInput = null;

        watcher.on('load.chat', () => this.load());
        settings.on('changed.tabAutocomplete', () => this.load(false));

        $('body').off('click.tabComplete focus.tabComplete keydown.tabComplete')
            .on('click.tabComplete focus.tabComplete', CHAT_INPUT, () => this.onFocus())
            .on('keydown.tabComplete', CHAT_INPUT, e => this.onKeydown(e));
    }

    load(chatLoad = true) {
        this.customInput.load(chatLoad);
        this.patchedInput.load(chatLoad);
        this.chatHistory.load(chatLoad);
        if (settings.get('tabAutocomplete')) {
            this.customInput.enable();
            this.currentInput = this.customInput;
        } else {
            this.customInput.disable();
            this.currentInput = this.patchedInput;
        }
    }

    onKeydown(e) {
        if (this.currentInput) {
            this.currentInput.onKeydown(e);
        }
        this.chatHistory.onKeydown(e);
    }

    onFocus() {
        if (this.currentInput) {
            this.currentInput.onFocus();
        }
        this.chatHistory.onFocus();
    }
}

module.exports = new ChatAutocompletionModule();
