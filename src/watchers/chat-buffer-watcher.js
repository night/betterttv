const twitch = require('../utils/twitch');

const PATCHED_SYMBOL = Symbol('patched');

function chatBufferWatcher(watcher) {
    let twitchConsumeEvent;
    let isPrevented = false;
    const preventDefault = () => (isPrevented = true);

    const emitEvent = event => {
        if (!event || typeof event.type !== 'number') return;
        watcher.emit('chat.buffer.event', { event, preventDefault });
    };

    function bttvConsumeEvent() {
        isPrevented = false;
        emitEvent(arguments[0]);
        if (isPrevented) return;

        return twitchConsumeEvent.apply(this, arguments);
    }

    const patchChatController = () => {
        const chatBuffer = twitch.getChatController().chatBuffer;
        if (!chatBuffer) return;

        const newTwitchConsumeEvent = chatBuffer.consumeChatEvent;
        if (chatBuffer._bttvConsumeEventPatched === PATCHED_SYMBOL) return;

        chatBuffer.consumeChatEvent = bttvConsumeEvent;
        chatBuffer._bttvConsumeEventPatched = PATCHED_SYMBOL;
        twitchConsumeEvent = newTwitchConsumeEvent;
    };

    watcher.on('load.chat', () => patchChatController());
}

module.exports = chatBufferWatcher;
