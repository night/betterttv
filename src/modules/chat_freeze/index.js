const $ = require('jquery');
const twitch = require('../../utils/twitch');

const CHAT_LINES = '.ember-chat .chat-messages .chat-lines';
const CHAT_ROOM_SELECTOR = '.chat-room > div.ember-view';

let isFrozen = false;

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

class ChatFreezeModule {
    constructor() {
        $('body')
            .on('keydown.chat-freeze', e => {
                if (!(e.metaKey || e.ctrlKey) || !$(`${CHAT_LINES}:hover`).length || document.hidden) return;
                isFrozen = true;
                setScrollState(false);
            })
            .on('keyup.chat-freeze', e => {
                if (e.metaKey || e.ctrlKey || !isFrozen) return;
                isFrozen = false;
                setScrollState(true);
            });
    }
}

module.exports = new ChatFreezeModule();
