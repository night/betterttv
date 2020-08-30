const $ = require('jquery');
const twitch = require('../utils/twitch');
const domObserver = require('../observers/dom');

module.exports = watcher => {
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
};
