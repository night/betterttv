const twitch = require('../utils/twitch');
const watcher = require('../watcher');

const PATCHED_SYMBOL = Symbol();

let twitchConsumeChatEvent;

function bttvConsumeChatEvent(event) {
    if (event && typeof event.type === 'number') {
        let isPrevented = false;
        watcher.emit('chat.buffer.event', {
            event,
            preventDefault: () => {
                isPrevented = true;
            }
        });
        if (isPrevented) return;
    }

    return twitchConsumeChatEvent.call(this, ...arguments);
}

function patchChatController() {
    const chatController = twitch.getChatController();
    if (!chatController) return;

    const chatBuffer = chatController.chatBuffer;
    if (!chatBuffer) return;

    const newTwitchConsumeChatEvent = chatBuffer.consumeChatEvent;
    if (
        chatBuffer._bttvConsumeChatEventPatched === PATCHED_SYMBOL ||
        newTwitchConsumeChatEvent === bttvConsumeChatEvent
    ) {
        return;
    }

    chatBuffer.consumeChatEvent = bttvConsumeChatEvent;
    chatBuffer._bttvConsumeChatEventPatched = PATCHED_SYMBOL;
    twitchConsumeChatEvent = newTwitchConsumeChatEvent;
}

class ChatBufferWatcher {
    constructor() {
        watcher.on('load.chat', () => patchChatController());
    }
}

module.exports = new ChatBufferWatcher();
