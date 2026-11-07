import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

class HideWatchStreaksModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => this.handleMessage(message));
  }

  handleMessage({message, preventDefault}) {
    // Watch streaks are delivered to chat as "viewer milestone" messages.
    if (
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.WATCH_STREAKS) &&
      message.type === twitch.getTMIActionTypes()?.VIEWER_MILESTONE
    ) {
      preventDefault();
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideWatchStreaksModule()]);
