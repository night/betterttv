import api from '../../utils/api.js';
import watcher from '../../watcher.js';
import settings from '../../settings.js';

import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.FRANKERFACEZ_GLOBAL,
  provider: EmoteProviders.FRANKERFACEZ,
  displayName: formatMessage({defaultMessage: 'FrankerFaceZ Global Emotes'}),
};

class GlobalEmotes extends AbstractEmotes {
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

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.FFZ_EMOTES)) return;

    api
      .get('cached/frankerfacez/emotes/global')
      .then((emotes) =>
        emotes.forEach(({id, user, code, images, animated, modifier}) => {
          this.emotes.set(
            code,
            new Emote({
              id,
              category: this.category,
              channel: user,
              code,
              images,
              animated,
              modifier,
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new GlobalEmotes();
