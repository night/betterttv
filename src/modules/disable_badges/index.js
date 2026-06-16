import {PlatformTypes, SettingIds, UsernameFlags} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

class DisableBadgesModule {
  constructor() {
    settings.on(`changed.${SettingIds.USERNAMES}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    const body = document.getElementsByTagName('body')[0];
    if (body == null) {
      return;
    }

    const shouldDisableBadges = !hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.BADGES);
    if (shouldDisableBadges) {
      body.classList.add('bttv-disable-badges');
    } else {
      body.classList.remove('bttv-disable-badges');
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableBadgesModule()]);
