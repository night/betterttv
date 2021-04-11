import $ from 'jquery';
import twitch from '../utils/twitch';
import domObserver from '../observers/dom';

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
};
