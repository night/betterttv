import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {SettingIds} from '../../constants.js';

const CHAT_LIST_SCROLL_CONTENT =
  '.chat-list .simplebar-scroll-content,.chat-list--default .simplebar-scroll-content,.chat-list--other .simplebar-scroll-content';

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
    settings.on(`changed.${SettingIds.REVERSE_CHAT_DIRECTION}`, () => this.toggleChatDirection());
    watcher.on('load.chat', () => this.toggleChatAutoScrolling());
    this.toggleChatDirection();
  }

  toggleChatAutoScrolling() {
    const scroller = twitch.getChatScroller();
    const reverseChatDirection = settings.get(SettingIds.REVERSE_CHAT_DIRECTION);
    if (!scroller) return;
    if (reverseChatDirection && scroller.scrollRef.scrollToTop && scroller.scrollToBottom) {
      if (oldScrollToBottom !== scroller.scrollRef.scrollToTop) {
        oldScrollToBottom = scroller.scrollToBottom;
      }
      scroller.scrollToBottom = scroller.scrollRef.scrollToTop;
      const scrollContent = $(CHAT_LIST_SCROLL_CONTENT);
      scrollContent.scrollTop(0);
      scrollContent.off('scroll', handleScrollEvent).on('scroll', handleScrollEvent);
    } else if (oldScrollToBottom) {
      scroller.scrollToBottom = oldScrollToBottom;
    }
  }

  toggleChatDirection() {
    $('body').toggleClass('bttv-chat-direction-reversed', settings.get(SettingIds.REVERSE_CHAT_DIRECTION));
    this.toggleChatAutoScrolling();
  }
}

export default new ChatDirection();
