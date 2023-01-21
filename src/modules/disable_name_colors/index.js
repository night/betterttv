import {PlatformTypes, SettingIds, UsernameFlags} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

class DisableNameColorsModule {
  constructor() {
    settings.on(`changed.${SettingIds.USERNAMES}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    document.body.classList.toggle(
      'bttv-disable-name-colors',
      !hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.COLORS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableNameColorsModule()]);
