import $ from 'jquery';
import debug from '../../utils/debug.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import emotes from '../emotes/index.js';
import {SettingIds} from '../../constants.js';

class EmoteMenuModule {
  constructor() {
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  async load() {
    if (window.emoteMenu) {
      if (settings.get(SettingIds.CLICK_TWITCH_EMOTES) === true) {
        $('#emote-menu-button').show();
      } else {
        $('#emote-menu-button').hide();
      }
      return;
    }

    // Inject the emote menu if option is enabled.
    if (settings.get(SettingIds.CLICK_TWITCH_EMOTES) === false) return;

    debug.log('Injecting Twitch Chat Emotes Script');
    await import('twitch-chat-emotes/script.min.js');

    debug.log('Hooking into Twitch Chat Emotes Script');
    try {
      // try/catch protects against re-registered emote getters
      window.emoteMenu.registerEmoteGetter('BetterTTV', () =>
        emotes.getEmotes(['bttv-emoji']).map(({code, images, provider}) => ({
          text: code,
          channel: provider.displayName,
          badge: provider.badge,
          url: images['2x'] || images['1x'],
        }))
      );
    } catch (e) {}
  }
}

export default new EmoteMenuModule();
