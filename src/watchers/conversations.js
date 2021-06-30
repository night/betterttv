import $ from 'jquery';
import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

export default function conversationsWatcher(watcher) {
  domObserver.on('.whispers-thread', (node, isConnected) => {
    if (!isConnected) return;

    const threadID = twitch.getConversationThreadId(node);
    if (!threadID) return;

    watcher.emit('conversation.new', threadID);
  });

  domObserver.on('.thread-message__message', (node, isConnected) => {
    if (!isConnected) return;

    const msgObject = twitch.getConversationMessageObject(node);
    if (!msgObject) return;

    const $node = $(node);
    const threadID = twitch.getConversationThreadId($node.closest('.whispers-thread,.whispers__messages')[0]);
    if (!threadID) return;

    watcher.emit('conversation.message', threadID, $node, msgObject);
  });
}
