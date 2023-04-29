import domObserver from '../observers/dom.js';

export default function kickWatcher(watcher) {
  function processMessageNode(node) {
    if (node == null) {
      return;
    }

    watcher.emit('kick.message', node, node.__data);
  }

  domObserver.on('.chat-entry', (node, isConnected) => {
    if (!isConnected) return;
    processMessageNode(node);
  });

  watcher.emit('load.kick');
}
