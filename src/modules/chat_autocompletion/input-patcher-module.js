const $ = require('jquery');
const watcher = require('../../watcher');
const emotes = require('../emotes');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');


const BTTV_EMOTES_ID = 'bttv-emotes';
const INPUT_FIELD_SELECTOR = '#twitch-chat-input';

function bttvEmToTwitch(bttvEm) {
    return {
        displayName: bttvEm.code,
        srcSet: Object.values(bttvEm.images).join(', '),
        id: `${bttvEm.id}`,
        token: bttvEm.code,
        __typename: 'Emote'
    };
}

function isSuggestionsShowing() {
    return !!$('[data-a-target="autocomplete-balloon"]')[0];
}

function setTextareaValue(txt, msg) {
    txt.value = msg;
    // setting the value of an input with react need an 'input' event
    const ev = new Event('input', { target: txt, bubbles: true });
    txt.dispatchEvent(ev);
}

class InputPatcherModule {
    constructor() {
        watcher.on('load.chat', () => {
            this.load();
        });

        this.debounceLoadEmotes = debounce(() => {
            this.loadEmotes();
        }, 4000, { leading: true, trailing: false });

        this.isEnabled = false;
        $('body').on('keydown', INPUT_FIELD_SELECTOR, e => this.onKeydown(e));
    }

    load() {
        this.messageHistory = [];
        this.historyPos = -1;
    }

    disable() {
        this.isEnabled = false;
    }

    enable() {
        this.isEnabled = true;
    }

    loadEmotes() {
        if (!this.isEnabled) return;
        const controller = twitch.getChatInputController();

        const emotesFormatted = emotes.getEmotes()
            .filter(em => !em.code.startsWith(':')) // emojis or any emote using special char break the chat.
            .map(bttvEmToTwitch);

        const emotesEntry = Object.values(controller.props.emotes)
            .find(v => v.id === BTTV_EMOTES_ID);

        if (emotesEntry) {
            emotesEntry.emotes = emotesFormatted;
        } else {
            controller.props.emotes.push({
                id: BTTV_EMOTES_ID,
                emotes: emotesFormatted
            });
        }
    }

    onSendMessage(message) {
        if (message.trim().length === 0) return;
        this.messageHistory.unshift(message);
        this.historyPos = -1;
    }

    onKeydown(e) {
        if (!this.isEnabled) return;
        this.debounceLoadEmotes();
        const keyCode = e.keyCode || e.which;
        if (e.ctrlKey) return;
        const $inputField = $(INPUT_FIELD_SELECTOR);

        // Message history
        if (keyCode === keyCodes.Enter && !e.shiftKey) {
            this.onSendMessage($inputField.val());
        } else if (keyCode === keyCodes.UpArrow) {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;
            const prevMsg = this.messageHistory[++this.historyPos];
            setTextareaValue($inputField[0], prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === keyCodes.DownArrow) {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                setTextareaValue($inputField[0], prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                setTextareaValue($inputField[0], '');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }
}

module.exports = InputPatcherModule;
