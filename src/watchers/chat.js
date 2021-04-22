import $ from 'jquery';
import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

const PATCHED_SENTINEL = Symbol('patched symbol');

let twitchHandleMessage;
let watcher;

function bttvHandleMessage(message, ...args) {
  if (message && typeof message.type === 'number') {
    let isPrevented = false;
    watcher.emit('chat.message.handler', {
      message,
      preventDefault: () => {
        isPrevented = true;
      },
    });
    if (isPrevented) return null;
  }

  return twitchHandleMessage.call(this, message, ...args);
}

function patchChatController() {
  const chatController = twitch.getChatController();
  if (!chatController) return;

  const {messageHandlerAPI} = chatController.props;
  if (!messageHandlerAPI) return;

  const {handleMessage} = messageHandlerAPI;
  if (chatController._bttvMessageHandlerPatched === PATCHED_SENTINEL || handleMessage === bttvHandleMessage) {
    return;
  }

  messageHandlerAPI.handleMessage = bttvHandleMessage;
  chatController._bttvMessageHandlerPatched = PATCHED_SENTINEL;
  twitchHandleMessage = handleMessage;
}

export default function chatWatcher(watcher_) {
  watcher = watcher_;

  watcher.on('load.chat', () => patchChatController());

  domObserver.on(
    '.viewer-card',
    (node, isConnected) => {
      if (!isConnected) {
        watcher.emit('chat.moderator_card.close');
        return;
      }

      watcher.emit('chat.moderator_card.open', $(node));
    },
    {attributes: true}
  );

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
