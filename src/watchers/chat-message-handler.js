const twitch = require('../utils/twitch');
const watcher = require('../watcher');

const PATCHED_SYMBOL = Symbol();

let twitchHandleMessage;

function bttvHandleMessage(message) {
    if (message && typeof message.type === 'number') {
        let isPrevented = false;
        watcher.emit('chat.message.handler', {
            message,
            preventDefault: () => {
                isPrevented = true;
            }
        });
        if (isPrevented) return;
    }

    return twitchHandleMessage.call(this, ...arguments);
}

function patchChatController() {
    const chatController = twitch.getChatController();
    if (!chatController) return;

    const messageHandlerAPI = chatController.props.messageHandlerAPI;
    if (!messageHandlerAPI) return;

    const {handleMessage} = messageHandlerAPI;
    if (
        messageHandlerAPI._bttvMessageHandlerPatched === PATCHED_SYMBOL ||
        handleMessage === bttvHandleMessage
    ) {
        return;
    }

    messageHandlerAPI.handleMessage = bttvHandleMessage;
    messageHandlerAPI._bttvMessageHandlerPatched = PATCHED_SYMBOL;
    twitchHandleMessage = handleMessage;
}

class ChatMessageHandlerWatcher {
    constructor() {
        watcher.on('load.chat', () => patchChatController());
    }
}

module.exports = new ChatMessageHandlerWatcher();
