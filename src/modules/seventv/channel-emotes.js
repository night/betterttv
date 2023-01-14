import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import Emote from '../emotes/emote.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentChannel} from '../../utils/channel.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.SEVENTV_CHANNEL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Channel Emotes'}),
};

function emoteUrl(id, version, static_ = false) {
  return `https://cdn.7tv.app/emote/${encodeURIComponent(id)}/${version}${static_ ? '_static' : ''}.webp`;
}

class SevenTVChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
  }

  get category() {
    return category;
  }

  updateChannelEmotes() {
    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_EMOTES)) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    fetch(
      `https://7tv.io/v3/users/${encodeURIComponent(currentChannel.provider)}/${encodeURIComponent(currentChannel.id)}`
    )
      .then((response) => response.json())
      .then(({emote_set: {emotes}}) => {
        for (const {
          id,
          name: code,
          data: {listed, animated, owner},
        } of emotes) {
          if (!listed) {
            continue;
          }

          this.emotes.set(
            code,
            new Emote({
              id,
              category: this.category,
              channel: {
                id: owner.id,
                name: owner.username,
                displayName: owner.display_name,
              },
              code,
              animated,
              images: {
                '1x': emoteUrl(id, '1x'),
                '2x': emoteUrl(id, '2x'),
                '4x': emoteUrl(id, '4x'),
                '1x_static': animated ? emoteUrl(id, '1x', true) : undefined,
                '2x_static': animated ? emoteUrl(id, '2x', true) : undefined,
                '4x_static': animated ? emoteUrl(id, '4x', true) : undefined,
              },
            })
          );
        }
      })
      .then(() => watcher.emit('emotes.updated'));
  }
}

export default new SevenTVChannelEmotes();
