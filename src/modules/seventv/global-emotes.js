import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import {createEmote} from './utils.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import formatMessage from '../../i18n/index.js';

// 7TV global emotes can be found here: https://7tv.app/emote-sets/62cdd34e72a832540de95857
// they seem to be clean.

const category = {
  id: EmoteCategories.SEVENTV_GLOBAL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Global Emotes'}),
};

let eventSource;

class SevenTVGlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateGlobalEmotes());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateGlobalEmotes());
  }

  get category() {
    return category;
  }

  updateGlobalEmotes() {
    if (eventSource != null) {
      try {
        eventSource.close();
      } catch (_) {}
    }

    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_EMOTES)) return;

    fetch(`https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857`)
      .then((response) => response.json())
      .then(({emotes: globalEmotes}) => {
        if (globalEmotes == null) {
          return;
        }

        for (const {
          id,
          name: code,
          data: {listed, animated, owner},
        } of globalEmotes) {
          if (!listed) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner, category));
        }
      })
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVGlobalEmotes();
