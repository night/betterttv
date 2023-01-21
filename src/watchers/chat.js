import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

const PATCHED_SENTINEL = Symbol('patched symbol');

const twitchHandleMessages = {};
let watcher;

function bttvHandleMessage(channelId, message, ...args) {
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

  return twitchHandleMessages[channelId].twitchHandleMessage.call(this, message, ...args);
}

function patchChatController() {
  const chatController = twitch.getChatController();
  if (!chatController) return;

  const {messageHandlerAPI, channelID} = chatController.props;
  if (!messageHandlerAPI) return;

  const {handleMessage: twitchHandleMessage} = messageHandlerAPI;
  const channelBttvHandleMessage =
    twitchHandleMessages[channelID]?.bttvHandleMessage ?? bttvHandleMessage.bind(messageHandlerAPI, channelID);
  if (
    chatController._bttvMessageHandlerPatched === PATCHED_SENTINEL ||
    twitchHandleMessage === channelBttvHandleMessage
  ) {
    return;
  }

  messageHandlerAPI.handleMessage = channelBttvHandleMessage;
  chatController._bttvMessageHandlerPatched = PATCHED_SENTINEL;
  twitchHandleMessages[channelID] = {twitchHandleMessage, bttvHandleMessage: channelBttvHandleMessage};
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

      watcher.emit('chat.moderator_card.open', node);
    },
    {attributes: true}
  );

  domObserver.on('.chat-line__message', (node, isConnected) => {
    if (!isConnected) return;

    const msgObject = twitch.getChatMessageObject(node);
    if (!msgObject) return;

    watcher.emit('chat.message', node, msgObject);
  });

  domObserver.on('[data-test-selector="user-notice-line"]', (node, isConnected) => {
    if (!isConnected) return;

    const msgObject = twitch.getChatMessageObject(node);
    if (!msgObject) return;

    watcher.emit('chat.notice_message', node, msgObject);
  });

  domObserver.on('.chat-line__status', (node, isConnected) => {
    if (!isConnected) return;

    const msgObject = twitch.getChatMessageObject(node);
    if (!msgObject) return;

    watcher.emit('chat.status', node, msgObject);
  });

  domObserver.on('.vod-message__content,.vod-message', (node, isConnected) => {
    if (!isConnected) return;

    watcher.emit('vod.message', node);
  });

  domObserver.on('.pinned-chat__message', (node, isConnected) => {
    if (!isConnected) return;

    watcher.emit('chat.pinned_message', node);
  });
}
