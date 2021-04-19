import $ from 'jquery';
import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

const PATCHED_SYMBOL = Symbol();

let twitchHandleMessage;
let watcher;

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

export default function(watcher_) {
    watcher = watcher_;

    watcher.on('load.chat', () => patchChatController());

    domObserver.on('.viewer-card', (node, isConnected) => {
        if (!isConnected) {
            watcher.emit('chat.moderator_card.close');
            return;
        }

        watcher.emit('chat.moderator_card.open', $(node));
    }, {attributes: true});

    domObserver.on('.chat-line__message', (node, isConnected) => {
        if (!isConnected) return;

        const msgObject = twitch.getChatMessageObject(node);
        if (!msgObject) return;

        watcher.emit('chat.message', $(node), msgObject);
    });

    domObserver.on('.vod-message__content,.vod-message', (node, isConnected) => {
        if (!isConnected) return;

        watcher.emit('vod.message', $(node));
    });
}
