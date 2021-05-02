import settings from '../../settings.js';
import watcher from '../../watcher.js';

class DisableLocalizedNamesModule {
  constructor() {
    settings.add({
      id: 'disableLocalizedNames',
      category: 'chat',
      name: 'Disable Localized Names',
      defaultValue: false,
      description: 'Hides localized display names in chat',
    });
    watcher.on('chat.message', ($el) => this.delocalizeName($el));
  }

  delocalizeName($el) {
    if (settings.get('disableLocalizedNames') === false) return;

    const $name = $el.find('.chat-author__display-name');
    const $login = $el.find('.chat-author__intl-login');
    if (!$login.length) return;

    $name.text($login.text().replace(/[()]/g, '').trim());
    $login.remove();
  }
}

export default new DisableLocalizedNamesModule();
