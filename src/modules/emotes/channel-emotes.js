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

  updateChannelEmotes({avatar, channelEmotes, sharedEmotes}) {
    this.emotes.clear();

    const emotes = channelEmotes.concat(sharedEmotes);

    const currentChannel = getCurrentChannel();
    const updatedChannel = {...currentChannel, avatar};
    setCurrentChannel(updatedChannel);

    emotes.forEach(({id, user, code, imageType}) =>
      this.emotes.set(
        code,
        new Emote({
          id,
          category: this.category,
          channel: user || updatedChannel,
          code,
          images: {
            '1x': cdn.emoteUrl(id, '1x'),
            '2x': cdn.emoteUrl(id, '2x'),
            '4x': cdn.emoteUrl(id, '3x'),
          },
          imageType,
        })
      )
    );

    setTimeout(() => watcher.emit('emotes.updated'), 0);
  }
}

export default new ChannelEmotes();
