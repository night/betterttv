import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';

class DisableHomepageAutoplayModule {
  constructor() {
    settings.add({
      id: 'disableFPVideo',
      category: 'chat',
      name: 'Disable Homepage Autoplay',
      defaultValue: false,
      description: 'Disables autoplaying streams on the homepage',
    });
    watcher.on('load.homepage', () => this.load());
  }

  load() {
    if (settings.get('disableFPVideo') === false) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;

    const stopAutoplay = () => {
      setTimeout(() => {
        currentPlayer.pause();
      }, 0);
      if (currentPlayer.emitter) {
        currentPlayer.emitter.removeListener('Playing', stopAutoplay);
      } else {
        currentPlayer.removeEventListener('play', stopAutoplay);
      }
    };

    if (currentPlayer.emitter) {
      currentPlayer.pause();
      currentPlayer.emitter.on('Playing', stopAutoplay);
    } else {
      currentPlayer.addEventListener('play', stopAutoplay);
    }
  }
}

export default new DisableHomepageAutoplayModule();
