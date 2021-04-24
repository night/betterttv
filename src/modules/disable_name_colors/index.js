import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

class DisableNameColorsModule {
  constructor() {
    settings.add({
      id: 'disableUsernameColors',
      categories: ['chat'],
      name: 'Disable Name Colors',
      defaultValue: false,
      description: 'Disables username colors in chat (useful for those with color blindness)',
    });
    settings.add({
      id: 'readableUsernameColors',
      categories: ['chat'],
      name: 'Readable Name Colors',
      defaultValue: true,
      description: 'Makes chat usernames higher contrast (prevents hard to read names)',
    });
    settings.on('changed.disableUsernameColors', () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    $('.chat-scrollable-area__message-container').toggleClass(
      'bttv-disable-name-colors',
      settings.get('disableUsernameColors')
    );
  }
}

export default new DisableNameColorsModule();
