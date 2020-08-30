const $ = require('jquery');
const twitch = require('../utils/twitch');
const domObserver = require('../observers/dom');

module.exports = watcher => {
    domObserver.on('.tw-mg-b-1', (node, isConnected) => {
        if (!isConnected || !node.parentNode.classList.contains('clips-chat-replay')) return;
        watcher.emit('clips.message', $(node));
    }, {useParentNode: true});

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
};
