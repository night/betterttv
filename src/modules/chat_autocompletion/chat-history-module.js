const $ = require('jquery');
const keyCodes = require('../../utils/keycodes');

function isSuggestionsShowing() {
    return !!$('[data-a-target="autocomplete-balloon"]')[0];
}

class ChatHistoryModule {
    load(resetHistory) {
        if (resetHistory) {
            this.messageHistory = [];
        }
        this.historyPos = -1;
    }

    onKeydown(e) {
        const keyCode = e.keyCode || e.which;
        if (e.ctrlKey) {
            return;
        }
        const $inputField = $(e.target);
        const setInputValue = value => {
            e.target.customSetValue(value);
        };

        if (keyCode === keyCodes.Enter && !e.shiftKey) {
            this.onSendMessage($inputField.val());
        } else if (keyCode === keyCodes.UpArrow) {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;
            const prevMsg = this.messageHistory[++this.historyPos];
            setInputValue(prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === keyCodes.DownArrow) {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                setInputValue(prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                $inputField.val('');
                setInputValue('');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }

    onSendMessage(message) {
        if (message.trim().length === 0) return;
        this.messageHistory.unshift(message);
        this.historyPos = -1;
    }

    onFocus() {
        this.historyPos = -1;
    }
}

module.exports = ChatHistoryModule;

