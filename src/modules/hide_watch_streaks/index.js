import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const HIDE_WATCH_STREAKS_CLASS = 'bttv-hide-watch-streaks';

function watchStreaksHidden() {
  return !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.WATCH_STREAKS);
}

class HideWatchStreaksModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => this.handleMessage(message));
    watcher.on('load', () => this.toggleWatchStreaks());
    settings.on(`changed.${SettingIds.CHAT}`, () => this.toggleWatchStreaks());
  }

  handleMessage({message, preventDefault}) {
    // Watch streaks are delivered to chat as "viewer milestone" messages.
    if (watchStreaksHidden() && message.type === twitch.getTMIActionTypes()?.VIEWER_MILESTONE) {
      preventDefault();
    }
  }

  toggleWatchStreaks() {
    document.body.classList.toggle(HIDE_WATCH_STREAKS_CLASS, watchStreaksHidden());
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideWatchStreaksModule()]);
