import watcher from '../../watcher.js';
import api from '../../utils/api.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';
import {EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentChannel} from '../../utils/channel.js';

const provider = {
  id: 'ffz-channel',
  displayName: 'FrankerFaceZ Channel Emotes',
};

class FrankerFaceZChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
  }

  get provider() {
    return provider;
  }

  updateChannelEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.FFZ_EMOTES)) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    api
      .get(`cached/frankerfacez/users/${currentChannel.provider}/${currentChannel.id}`)
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

export default new FrankerFaceZChannelEmotes();
