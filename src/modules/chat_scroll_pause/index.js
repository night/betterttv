import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const WHEEL_LISTENER_OPTIONS = {capture: true, passive: true};

class ChatScrollPauseModule {
  constructor() {
    this.scrollContent = null;
    this.handleWheel = this.handleWheel.bind(this);

    watcher.on('load.chat', () => this.load());
  }

  load() {
    const scrollContent = twitch.getChatScroller()?.scrollRef?.scrollContent ?? null;
    if (scrollContent === this.scrollContent) {
      return;
    }

    this.scrollContent?.removeEventListener('wheel', this.handleWheel, true);
    this.scrollContent = scrollContent;
    this.scrollContent?.addEventListener('wheel', this.handleWheel, WHEEL_LISTENER_OPTIONS);
  }

  handleWheel(event) {
    if (event.deltaY >= 0 || event.ctrlKey || event.metaKey || settings.get(SettingIds.REVERSE_CHAT_DIRECTION)) {
      return;
    }

    const scroller = twitch.getChatScroller();
    const scrollContent = scroller?.scrollRef?.scrollContent;
    if (
      scrollContent !== event.currentTarget ||
      scrollContent.scrollHeight <= scrollContent.clientHeight ||
      scroller.state?.isPaused ||
      typeof scroller.pause !== 'function'
    ) {
      return;
    }

    // Twitch checks the scroll position in its wheel handler before the browser applies the wheel
    // delta. Pause first so a fast incoming message cannot snap the chat back to the bottom.
    scroller.pause();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatScrollPauseModule()]);
