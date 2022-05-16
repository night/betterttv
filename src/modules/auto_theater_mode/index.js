import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const TWITCH_THEATER_MODE_CHANGED_DISPATCH_TYPE = 'core.ui.THEATRE_ENABLED';

class AutoTheaterModeModule {
  constructor() {
    watcher.on('load.player', () => this.load());
  }

  load() {
    if (settings.get(SettingIds.AUTO_THEATRE_MODE) === false) return;

    const connectStore = twitch.getConnectStore();
    if (!connectStore) return;

    connectStore.dispatch({
      type: TWITCH_THEATER_MODE_CHANGED_DISPATCH_TYPE,
    });
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoTheaterModeModule()]);
