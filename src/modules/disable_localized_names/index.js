import {PlatformTypes, SettingIds, UsernameFlags} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

class DisableLocalizedNamesModule {
  constructor() {
    watcher.on('chat.message', (el) => this.delocalizeName(el));
  }

  delocalizeName(el) {
    if (hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.LOCALIZED)) return;

    const name = el.querySelector('.chat-author__display-name');
    const login = el.querySelector('.chat-author__intl-login');
    if (login == null) return;

    name.innerText = login.textContent.replace(/[()]/g, '').trim();
    login.remove();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableLocalizedNamesModule()]);
