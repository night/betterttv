import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import settings from '../../settings.js';
import api from '../../utils/api.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {hasFlag} from '../../utils/flags.js';
import watcher from '../../watcher.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';

const category = {
  id: EmoteCategories.FRANKERFACEZ_CHANNEL,
  provider: EmoteProviders.FRANKERFACEZ,
  displayName: formatMessage({defaultMessage: 'FrankerFaceZ Channel Emotes'}),
};

class FrankerFaceZChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateChannelEmotes());
  }

  get category() {
    return category;
  }

  updateChannelEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.FFZ_EMOTES)) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    api
      .get(`cached/frankerfacez/users/${currentChannel.provider}/${currentChannel.id}`)
      .then((emotes) =>
        emotes.forEach(({id, user, code, images, animated, modifier}) => {
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
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new FrankerFaceZChannelEmotes();
