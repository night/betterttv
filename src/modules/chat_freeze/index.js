const $ = require('jquery');
const twitch = require('../../utils/twitch');
const keycodes = require('../../utils/keycodes');
const watcher = require('../../watcher');

const CHAT_CONTAINER_SELECTOR = '.chat-room .chat-messages';
const CHAT_CONTENT_SELECTOR = '.chat-messages .tse-content';
const CHAT_LINES_SELECTOR = '.ember-chat .chat-messages .chat-lines';
const CHAT_ROOM_SELECTOR = '.chat-room > div.ember-view';
const CHAT_SCROLLER_SELECTOR = '.chat-messages .tse-scroll-content';
const MESSAGES_INDICATOR_SELECTOR = '.more-messages-indicator';
const FREEZE_KEYS = [keycodes.Ctrl, keycodes.Meta];
const CHAT_SCROLL_THRESHOLD = 150;

let keysPressed = 0;

function setScrollState(enabled) {
    const chatRoomEmberId = $(CHAT_ROOM_SELECTOR).attr('id');
    const chatComponent = twitch.getEmberView(chatRoomEmberId);
    if (!chatComponent) return;

    if (enabled) {
        chatComponent._scrollToBottom();
    } else {
        chatComponent._setStuckToBottom(false);
    }
}

function shouldFreeze(e) {
    return FREEZE_KEYS.includes(e.keyCode) && $(`${CHAT_LINES_SELECTOR}:hover`).length && !document.hidden;
}

// TODO: we really shouldn't have to do this.. this is a bandaid
let chatComponent;
function scrollOnEmoteLoad($el) {
    $el.find('img.emoticon').on('load', () => {
        const indicator = $(MESSAGES_INDICATOR_SELECTOR).length > 0;
        if (!chatComponent || indicator) return;
        chatComponent._scrollToBottom();
    });
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
        watcher.on('load.chat', () => this.load());
        watcher.on('chat.message', $el => scrollOnEmoteLoad($el));
    }

    load() {
        $(CHAT_CONTAINER_SELECTOR).on('mousewheel', ({originalEvent}) => {
            const indicator = $(MESSAGES_INDICATOR_SELECTOR).length > 0;
            const $chatContent = $(CHAT_CONTENT_SELECTOR);
            const $chatScroller = $(CHAT_SCROLLER_SELECTOR);

            if (!$chatScroller.length || !$chatContent.length) return;

            if (originalEvent.wheelDelta > 0 && !indicator) {
                if ($chatScroller[0].scrollHeight - $chatScroller[0].scrollTop - $chatScroller.height() > CHAT_SCROLL_THRESHOLD) {
                    setScrollState(false);
                }
            } else if (originalEvent.wheelDelta < 0 && indicator) {
                if ($chatContent.offset().top + $chatContent.height() - $chatScroller.height() < CHAT_SCROLL_THRESHOLD) {
                    setScrollState(true);
                }
            }
        });

        const chatRoomEmberId = $(CHAT_ROOM_SELECTOR).attr('id');
        chatComponent = twitch.getEmberView(chatRoomEmberId);
    }
}

module.exports = new ChatFreezeModule();
