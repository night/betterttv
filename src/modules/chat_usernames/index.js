import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

class DisableNameColorsModule {
  constructor() {
    settings.add({
      id: 'chatUsernames',
      type: 2,
      options: {
        choices: ['Colored', 'High Contrast', 'Translated'],
      },
      category: 'chat',
      name: 'Chat Usernames',
      defaultValue: [0, 2],
      description: 'Modify/edit chat usernames',
    });

    watcher.on('chat.message', ($el) => this.delocalizeName($el));
    settings.on('changed.chatUsernames', (values) => this.showChatColours(values.includes(0)));
    watcher.on('load.chat', () => this.showChatColours(settings.get('chatUsernames').includes(0)));
  }

  delocalizeName($el) {
    if (!settings.get('chatUsernames').includes(2)) return;

    const $name = $el.find('.chat-author__display-name');
    const $login = $el.find('.chat-author__intl-login');
    if (!$login.length) return;

    $name.text($login.text().replace(/[()]/g, '').trim());
    $login.remove();
  }

  showChatColours(enable) {
    $('.chat-scrollable-area__message-container').toggleClass('bttv-disable-name-colors', !enable);
  }
}

export default new DisableNameColorsModule();
