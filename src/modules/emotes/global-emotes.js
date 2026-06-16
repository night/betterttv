import {getGlobalEmotes} from '@/actions/emotes';
import {EmoteCategories, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import subscribers from '@/modules/subscribers/index';
import cdn from '@/utils/cdn';
import watcher from '@/watcher';
import AbstractEmotes from './abstract-emotes';
import Emote from './emote';

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
    getGlobalEmotes()
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
