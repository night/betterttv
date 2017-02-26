const CHAT_LINES = '.ember-chat .chat-messages .chat-lines';
const CHAT_SCROLLER = '.ember-chat .chat-messages .tse-scroll-content';

let isFrozen = false;

function setScrollState(enabled) {
    const $chatLines = jQuery(CHAT_LINES);
    $chatLines.css('padding-bottom', enabled ? 0 : 50);
    const $chatScroller = jQuery(CHAT_SCROLLER);
    $chatScroller[0].scrollTop = $chatScroller[0].scrollHeight - (enabled ? 0 : 469);
    $chatScroller.trigger('mousewheel');
}

class ChatFreezeModule {
    constructor() {
        $('body')
            .on('keydown.chat-freeze', e => {
                if (!(e.metaKey || e.ctrlKey) || !$(`${CHAT_LINES}:hover`).length || document.hidden) return;
                isFrozen = true;
                setScrollState(false);
            })
            .on('keyup.chat-freeze', e => {
                if (e.metaKey || e.ctrlKey || !isFrozen) return;
                isFrozen = false;
                setScrollState(true);
            });
    }
}

module.exports = new ChatFreezeModule();
