import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import {createEmote, isOverlay} from './utils.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.SEVENTV_GLOBAL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Global Emotes'}),
};

class SevenTVGlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateGlobalEmotes());

    this.updateGlobalEmotes();
  }

  get category() {
    return category;
  }

  updateGlobalEmotes() {
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
          flags,
          data: {listed, animated, owner},
        } of globalEmotes) {
          if (!listed) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner, category, isOverlay(flags)));
        }
      })
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVGlobalEmotes();
