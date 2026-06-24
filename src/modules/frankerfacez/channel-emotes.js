import {getFrankerFaceZChannelEmotes} from '@/actions/emotes';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import AbstractEmotes from '@/modules/emotes/abstract-emotes';
import Emote from '@/modules/emotes/emote';
import settings from '@/settings';
import {getCurrentChannel} from '@/utils/channel';
import {hasFlag} from '@/utils/flags';
import watcher from '@/watcher';

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

    getFrankerFaceZChannelEmotes(currentChannel.provider, currentChannel.id)
      .then((emotes) =>
        emotes.forEach(({id, user, code, images, animated, modifier, imageType}) => {
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
              metadata: {imageType},
            })
          );
        })
      )
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new FrankerFaceZChannelEmotes();
