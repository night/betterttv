const $ = require('jquery');
const settings = require('../../settings');
const twitch = require('../../utils/twitch');

const CHAT_LIST_SCROLL_CONTENT = '.chat-list .chat-list__lines .simplebar-scroll-content';

let oldScrollToBottom;

class ChatDirection {
    constructor() {
        settings.add({
            id: 'reverseChatDirection',
            name: 'Reverse Chat Messages Direction',
            defaultValue: false,
            description: 'New chat messages come from the top'
        });
        settings.on('changed.reverseChatDirection', () => this.toggleChatDirection());
        settings.on('load.chat', () => this.toggleChatAutoScrolling());
        this.toggleChatDirection();
    }

    toggleChatAutoScrolling() {
        const scroller = twitch.getChatScroller();
        const reverseChatDirection = settings.get('reverseChatDirection');
        if (!scroller) return;
        if (reverseChatDirection && scroller.scroll.scrollToTop && scroller.scrollToBottom) {
            if (oldScrollToBottom !== scroller.scroll.scrollToTop) {
                oldScrollToBottom = scroller.scrollToBottom;
            }
            scroller.scrollToBottom = scroller.scroll.scrollToTop;
            $(CHAT_LIST_SCROLL_CONTENT)[0].scrollTop = 0;
        } else if (oldScrollToBottom) {
            scroller.scrollToBottom = oldScrollToBottom;
        }
    }

    toggleChatDirection() {
        $('body').toggleClass('bttv-chat-direction-reversed', settings.get('reverseChatDirection'));
        this.toggleChatAutoScrolling();
    }
}

module.exports = new ChatDirection();
