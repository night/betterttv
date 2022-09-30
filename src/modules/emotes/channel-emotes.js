import watcher from '../../watcher.js';
import cdn from '../../utils/cdn.js';
import {getCurrentChannel, setCurrentChannel} from '../../utils/channel.js';

import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';
import {EmoteCategories, EmoteProviders} from '../../constants.js';

const category = {
  id: EmoteCategories.BETTERTTV_CHANNEL,
  provider: EmoteProviders.BETTERTTV,
  displayName: 'BetterTTV Channel Emotes',
};

class ChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', (d) => this.updateChannelEmotes(d));
  }

  get category() {
    return category;
  }

  upsertChannelEmote({id, user, imageType, code}) {
    this.emotes.set(
      code,
      new Emote({
        id,
        category: this.category,
        channel: user || getCurrentChannel(),
        code,
        images: {
          '1x': cdn.emoteUrl(id, '1x'),
          '2x': cdn.emoteUrl(id, '2x'),
          '4x': cdn.emoteUrl(id, '3x'),
        },
        imageType,
      })
    );
  }

  updateChannelEmotes({avatar, channelEmotes, sharedEmotes}) {
    this.emotes.clear();

    const emotes = channelEmotes.concat(sharedEmotes);

    const updatedChannel = getCurrentChannel();
    setCurrentChannel({...updatedChannel, avatar});

    emotes.forEach((emote) => this.upsertChannelEmote(emote));

    setTimeout(() => watcher.emit('emotes.updated'), 0);
  }
}

export default new ChannelEmotes();
