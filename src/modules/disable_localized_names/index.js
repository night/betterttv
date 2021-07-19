import {SettingIds, UsernameFlags} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import watcher from '../../watcher.js';

class DisableLocalizedNamesModule {
  constructor() {
    watcher.on('chat.message', ($el) => this.delocalizeName($el));
  }

  delocalizeName($el) {
    if (hasFlag(settings.get(SettingIds.USERNAMES), UsernameFlags.LOCALIZED)) return;

    const $name = $el.find('.chat-author__display-name');
    const $login = $el.find('.chat-author__intl-login');
    if (!$login.length) return;

    $name.text($login.text().replace(/[()]/g, '').trim());
    $login.remove();
  }
}

export default new DisableLocalizedNamesModule();
