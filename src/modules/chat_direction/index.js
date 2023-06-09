import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

const CHAT_LIST_SCROLL_CONTENT =
  '.chat-list .simplebar-scroll-content,.chat-list--default .simplebar-scroll-content,.chat-list--other .simplebar-scroll-content';

const VOD_CHAT_LIST_SCROLL_CONTENT = '.video-chat__message-list-wrapper';

let oldScrollToBottom;
let oldAtBottom;

function handleScrollEvent(event) {
  if (event.target.scrollTop === 0) {
    const scroller = twitch.getChatScroller();
    if (scroller && scroller.state && scroller.state.isAutoScrolling === false) {
      // hackfix: auto scrolling wont resume when at top
      const scrollContent = document.querySelector(CHAT_LIST_SCROLL_CONTENT);
      if (scrollContent != null) {
        scrollContent.scrollTop = 50;
      }
      scroller.resume();
    }
  }
}

function handleVodScrollEvent() {
  const scroller = twitch.getVodChatScroller();

  // Chat doesn't automatically stay scrolled to the top when new messages are added
  // so we manually scroll to the top if sync is enabled
  if (scroller.props.isScrollingSynced) {
    const scrollContent = document.querySelector(VOD_CHAT_LIST_SCROLL_CONTENT);
    if (scrollContent != null) {
      scrollContent.scrollTop = 0;
    }
  }
}

class ChatDirection {
  constructor() {
    settings.on(`changed.${SettingIds.REVERSE_CHAT_DIRECTION}`, () => this.toggleChatDirection());
    watcher.on('load.chat', () => this.toggleChatAutoScrolling());
    watcher.on('load.vod', () => this.toggleVodChatAutoScrolling());
    this.toggleChatDirection();
  }

  toggleChatAutoScrolling() {
    const scroller = twitch.getChatScroller();
    const reverseChatDirection = settings.get(SettingIds.REVERSE_CHAT_DIRECTION);
    if (!scroller) return;
    if (reverseChatDirection && scroller.scrollToBottom) {
      if (scroller.scrollRef.bttvScrollToTop == null) {
        scroller.bttvScrollToTop = () => {
          scroller.scrollRef.scrollContent.scrollTop = 0;
        };
      }
      if (oldScrollToBottom !== scroller.bttvScrollToTop) {
        oldScrollToBottom = scroller.scrollToBottom;
      }
      scroller.scrollToBottom = scroller.bttvScrollToTop;
      const scrollContent = document.querySelector(CHAT_LIST_SCROLL_CONTENT);
      if (scrollContent != null) {
        scrollContent.scrollTop = 0;
        scrollContent.removeEventListener('scroll', handleScrollEvent);
        scrollContent.addEventListener('scroll', handleScrollEvent);
      }
    } else if (oldScrollToBottom) {
      scroller.scrollToBottom = oldScrollToBottom;
    }
  }

  toggleVodChatAutoScrolling() {
    const scroller = twitch.getVodChatScroller();
    const reverseChatDirection = settings.get(SettingIds.REVERSE_CHAT_DIRECTION);
    if (!scroller) return;

    const scrollContent = document.querySelector(VOD_CHAT_LIST_SCROLL_CONTENT);
    if (scrollContent == null) {
      return;
    }

    if (reverseChatDirection) {
      if (scroller.bttvAtBottom == null) {
        // When we're not at the bottom it shows the "auto scroll" message,
        // but when we're reversing chat direction we should check if we're at the top
        scroller.bttvAtBottom = () => scrollContent.scrollTop <= 1;
      }

      if (oldAtBottom !== scroller.bttvAtBottom) {
        oldAtBottom = scroller.atBottom;
      }
      scroller.atBottom = scroller.bttvAtBottom;

      scrollContent.scrollTop = 0;
      scrollContent.removeEventListener('scroll', handleVodScrollEvent);
      scrollContent.addEventListener('scroll', handleVodScrollEvent);
    } else if (oldAtBottom) {
      scroller.atBottom = oldAtBottom;
      scrollContent.removeEventListener('scroll', handleVodScrollEvent);

      if (scroller.props.isScrollingSynced) {
        scrollContent.scrollTop = scrollContent.scrollHeight;
      }
    }
  }

  toggleChatDirection() {
    document.body.classList.toggle('bttv-chat-direction-reversed', settings.get(SettingIds.REVERSE_CHAT_DIRECTION));
    this.toggleChatAutoScrolling();
    this.toggleVodChatAutoScrolling();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatDirection()]);
