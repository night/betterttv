import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

const TWITCH_THEATER_MODE_CHANGED_DISPATCH_TYPE = 'core.ui.THEATRE_ENABLED';

class AutoTheaterModeModule {
  constructor() {
    watcher.on('load.player', () => this.load());
  }

  load(reload = true) {
    if (settings.get(SettingIds.AUTO_THEATRE_MODE) === false) return;

    const connectStore = twitch.getConnectStore();
    if (!connectStore || document.querySelector('.channel-root.channel-root--live.channel-root--watch') == null) return;

    connectStore.dispatch({
      type: TWITCH_THEATER_MODE_CHANGED_DISPATCH_TYPE,
    });

    // reload once in case the player was reloaded somehow
    if (reload) {
      setTimeout(() => this.load(false), 1000);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoTheaterModeModule()]);
