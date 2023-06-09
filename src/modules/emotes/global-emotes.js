import {EmoteCategories, EmoteProviders} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import api from '../../utils/api.js';
import cdn from '../../utils/cdn.js';
import watcher from '../../watcher.js';
import subscribers from '../subscribers/index.js';
import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';

const category = {
  id: EmoteCategories.BETTERTTV_GLOBAL,
  provider: EmoteProviders.BETTERTTV,
  displayName: formatMessage({defaultMessage: 'BetterTTV Global Emotes'}),
};

class GlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    this.updateGlobalEmotes();
  }

  get category() {
    return category;
  }

  updateGlobalEmotes() {
    api
      .get('cached/emotes/global')
      .then((emotes) =>
        emotes.forEach(({id, code, animated, restrictions, modifier}) => {
          let restrictionCallback;
          if (restrictions && restrictions.emoticonSet) {
            restrictionCallback = (_, user) => {
              if (restrictions.emoticonSet !== 'night') return false;
              return user ? subscribers.hasLegacySubscription(user.name) : false;
            };
          }

          this.emotes.set(
            code,
            new Emote({
              id,
              category: this.category,
              channel: undefined,
              code,
              images: {
                '1x': cdn.emoteUrl(id, '1x'),
                '2x': cdn.emoteUrl(id, '2x'),
                '4x': cdn.emoteUrl(id, '3x'),
                '1x_static': animated ? cdn.emoteUrl(id, '1x', true) : undefined,
                '2x_static': animated ? cdn.emoteUrl(id, '2x', true) : undefined,
                '4x_static': animated ? cdn.emoteUrl(id, '3x', true) : undefined,
              },
              animated,
              restrictionCallback,
              modifier,
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new GlobalEmotes();
