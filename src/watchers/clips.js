import $ from 'jquery';
import twitch from '../utils/twitch.js';
import domObserver from '../observers/dom.js';

export default function clipsWatcher(watcher) {
  domObserver.on('.gbrRBA', (node, isConnected) => {
    if (!isConnected || !node.parentNode.classList.contains('clips-chat-replay')) return;
    watcher.emit('clips.message', $(node));
  });

  twitch.updateCurrentChannel();

  let interval;

  const timeoutInterval = setTimeout(() => interval && clearInterval(interval), 10000);

  interval = setInterval(() => {
    const currentChannel = twitch.updateCurrentChannel();
    if (!currentChannel) {
      return;
    }
    watcher.emit('load.clips');
    watcher.emit('load.channel');
    clearInterval(interval);
    interval = undefined;
    clearTimeout(timeoutInterval);
  }, 100);
}
