import {getFrankerFaceZGlobalEmotes} from '@/actions/emotes';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import AbstractEmotes from '@/modules/emotes/abstract-emotes';
import Emote from '@/modules/emotes/emote';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import watcher from '@/watcher';

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

    getFrankerFaceZGlobalEmotes()
      .then((emotes) =>
        emotes.forEach(({id, user, code, images, animated, modifier, imageType}) => {
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
              metadata: {imageType},
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new GlobalEmotes();
