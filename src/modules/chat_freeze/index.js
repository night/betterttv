const $ = require('jquery');
const twitch = require('../../utils/twitch');
const keycodes = require('../../utils/keycodes');

const CHAT_LIST_SELECTOR = '.chat-list';
const MESSAGES_INDICATOR_SELECTOR = '.chat-list__more-messages';
const FREEZE_KEYS = [keycodes.Ctrl, keycodes.Meta];

let keysPressed = 0;

function setScrollState(enabled) {
    const scroller = twitch.getChatScroller();
    if (!scroller) return;
    scroller.setState({
        isAutoScrolling: enabled
    });
}

function shouldFreeze(e) {
    return FREEZE_KEYS.includes(e.charCode || e.keyCode) && $(`${CHAT_LIST_SELECTOR}:hover`).length && !document.hidden;
}

class ChatFreezeModule {
    constructor() {
        $('body')
            .on('keydown.chat-freeze', e => {
                keysPressed++;

                if (!shouldFreeze(e)) return;
                keysPressed = 0;
            })
            .on('keyup.chat-freeze', e => {
                if (!shouldFreeze(e) || keysPressed > 0) return;

                const indicator = $(MESSAGES_INDICATOR_SELECTOR).length > 0;
                setScrollState(indicator);
            });
    }
}

module.exports = new ChatFreezeModule();
