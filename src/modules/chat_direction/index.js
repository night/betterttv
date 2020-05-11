const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const CHAT_LIST_SCROLL_CONTENT = '.chat-list .chat-list__lines .simplebar-scroll-content';

let oldScrollToBottom;

function handleScrollEvent(event) {
    if (event.target.scrollTop === 0) {
        const scroller = twitch.getChatScroller();
        if (scroller && scroller.state && scroller.state.isAutoScrolling === false) {
            // hackfix: auto scrolling wont resume when at top
            $(CHAT_LIST_SCROLL_CONTENT).scrollTop(50);
            scroller.resume();
        }
    }
}

class ChatDirection {
    constructor() {
        settings.add({
            id: 'reverseChatDirection',
            name: 'Reverse Chat Messages Direction',
            defaultValue: false,
            description: 'Moves new chat messages to the top of chat'
        });
        settings.on('changed.reverseChatDirection', () => this.toggleChatDirection());
        watcher.on('load.chat', () => this.toggleChatAutoScrolling());
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
            const scrollContent = $(CHAT_LIST_SCROLL_CONTENT);
            scrollContent.scrollTop(0);
            scrollContent.off('scroll', handleScrollEvent).on('scroll', handleScrollEvent);
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
