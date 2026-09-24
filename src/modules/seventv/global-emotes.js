import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import AbstractEmotes from '@/modules/emotes/abstract-emotes';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import watcher from '@/watcher';
import {createEmote, isOverlay} from './utils';

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

    fetch(`https://7tv.io/v3/emote-sets/global`)
      .then((response) => response.json())
      .then(({emotes: globalEmotes}) => {
        if (globalEmotes == null) {
          return;
        }

        for (const {
          id,
          name: code,
          timestamp,
          data: {
            listed,
            animated,
            owner,
            flags,
            host: {url},
          },
        } of globalEmotes) {
          if (!listed && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES)) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner, category, isOverlay(flags), url, timestamp));
        }
      })
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVGlobalEmotes();
