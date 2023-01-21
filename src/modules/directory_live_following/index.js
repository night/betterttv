import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

class DirectoryLiveFollowingModule {
  constructor() {
    watcher.on('load.directory.following', () => this.load());
  }

  load(retries = 0) {
    if (settings.get(SettingIds.SHOW_DIRECTORY_LIVE_TAB) === false || retries > 10) return false;
    const button = document.querySelector('a[href="/directory/following/live"]');
    if (button == null) {
      return setTimeout(() => this.load(retries + 1), 250);
    }
    button.click();
    return true;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DirectoryLiveFollowingModule()]);
