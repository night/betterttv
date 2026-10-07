import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const HIDE_WATCH_STREAKS_CLASS = 'bttv-hide-watch-streaks';
const HIDE_SAVE_YOUR_STREAK_CLASS = 'bttv-hide-save-your-streak';

function watchStreaksHidden() {
  return !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.WATCH_STREAKS);
}

function saveYourStreakHidden() {
  return !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.SAVE_YOUR_STREAK);
}

class HideWatchStreaksModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => this.handleMessage(message));
    watcher.on('load', () => this.toggleStreakVisibility());
    settings.on(`changed.${SettingIds.CHAT}`, () => this.toggleStreakVisibility());
  }

  handleMessage({message, preventDefault}) {
    // Watch streaks are delivered to chat as "viewer milestone" messages.
    if (watchStreaksHidden() && message.type === twitch.getTMIActionTypes()?.VIEWER_MILESTONE) {
      preventDefault();
    }
  }

  toggleStreakVisibility() {
    document.body.classList.toggle(HIDE_WATCH_STREAKS_CLASS, watchStreaksHidden());
    document.body.classList.toggle(HIDE_SAVE_YOUR_STREAK_CLASS, saveYourStreakHidden());
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideWatchStreaksModule()]);
