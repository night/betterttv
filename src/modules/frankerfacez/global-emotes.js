import api from '../../utils/api.js';
import watcher from '../../watcher.js';
import settings from '../../settings.js';

import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';

const provider = {
  id: 'ffz-global',
  displayName: 'FrankerFaceZ Global Emotes',
};

class GlobalEmotes extends AbstractEmotes {
  constructor() {
    super();
    settings.on('changed.ffzEmotes', () => this.updateGlobalEmotes());
  }

  get provider() {
    return provider;
  }

  updateGlobalEmotes() {
    this.emotes.clear();

    if (!settings.get('emotes').includes(2)) return;

    api
      .get('cached/frankerfacez/emotes/global')
      .then((emotes) =>
        emotes.forEach(({id, user, code, images, imageType}) => {
          this.emotes.set(
            code,
            new Emote({
              id,
              provider: this.provider,
              channel: user,
              code,
              images,
              imageType,
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new GlobalEmotes();
