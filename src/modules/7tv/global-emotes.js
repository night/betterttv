import watcher from '../../watcher.js';
import settings from '../../settings.js';

import AbstractEmotes from '../emotes/abstract-emotes.js';
import {EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {request, create7tvEmote} from './utils.js';

const provider = {
  id: '7tv-global',
  displayName: '7TV Global Emotes',
};

class SevenTvGlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateGlobalEmotes());

    this.updateGlobalEmotes();
  }

  get provider() {
    return provider;
  }

  updateGlobalEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags['7TV_EMOTES'])) return;

    request('emotes/global')
      .then((emotes) =>
        emotes.forEach((sevenTvEmote) => {
          const emote = create7tvEmote(sevenTvEmote, provider);
          this.emotes.set(emote.code, emote);
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTvGlobalEmotes();
