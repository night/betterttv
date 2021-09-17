import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import {EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {request, create7tvEmote} from './utils.js';

const provider = {
  id: '7tv-channel',
  displayName: '7TV Channel Emotes',
};

class SevenTvChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
  }

  get provider() {
    return provider;
  }

  updateChannelEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags['7TV_EMOTES'])) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    request(`users/${currentChannel.name}/emotes`)
      .then((emotes) =>
        emotes.forEach((sevenTvEmote) => {
          const emote = create7tvEmote(sevenTvEmote, provider);
          this.emotes.set(emote.code, emote);
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTvChannelEmotes();
