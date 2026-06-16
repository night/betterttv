import {PlatformTypes, SettingIds, UsernameFlags} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

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
