import $ from 'jquery';
import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

export default function (watcher) {
  domObserver.on('.whispers-thread', (node, isConnected) => {
    if (!isConnected) return;

    watcher.emit('conversation.new', $(node));
  });

  domObserver.on('.thread-message__message', (node, isConnected) => {
    if (!isConnected) return;

    const msgObject = twitch.getConversationMessageObject(node);
    if (!msgObject) return;

    watcher.emit('conversation.message', $(node), msgObject);
  });
}
