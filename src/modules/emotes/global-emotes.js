import api from '../../utils/api.js';
import cdn from '../../utils/cdn.js';
import legacySubscribers from '../legacy_subscribers/index.js';
import watcher from '../../watcher.js';
import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';

const provider = {
  id: 'bttv',
  displayName: 'BetterTTV Global Emotes',
  badge: cdn.url('tags/developer.png'),
};

class GlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    this.updateGlobalEmotes();
  }

  get provider() {
    return provider;
  }

  updateGlobalEmotes() {
    api
      .get('cached/emotes/global')
      .then((emotes) =>
        emotes.forEach(({id, code, imageType, restrictions}) => {
          let restrictionCallback;
          if (restrictions && restrictions.emoticonSet) {
            restrictionCallback = (_, user) => {
              if (restrictions.emoticonSet !== 'night') return false;
              return user ? legacySubscribers.hasSubscription(user.name) : false;
            };
          }

          this.emotes.set(
            code,
            new Emote({
              id,
              provider: this.provider,
              channel: undefined,
              code,
              images: {
                '1x': cdn.emoteUrl(id, '1x'),
                '2x': cdn.emoteUrl(id, '2x'),
                '4x': cdn.emoteUrl(id, '3x'),
              },
              imageType,
              restrictionCallback,
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new GlobalEmotes();
