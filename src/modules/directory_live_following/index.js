import $ from 'jquery';
import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

class DirectoryLiveFollowingModule {
  constructor() {
    watcher.on('load.directory.following', () => this.load());
  }

  load(retries = 0) {
    if (settings.get(SettingIds.SHOW_DIRECTORY_LIVE_TAB) === false || retries > 10) return false;
    const button = $('a[href="/directory/following/live"]');
    if (!button.length) {
      return setTimeout(() => this.load(retries + 1), 250);
    }
    button[0].click();
    return true;
  }
}

export default new DirectoryLiveFollowingModule();
