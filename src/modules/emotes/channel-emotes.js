import {EmoteCategories, EmoteProviders} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import socketClient, {deserializeSocketChannel, EventNames} from '../../socket-client.js';
import cdn from '../../utils/cdn.js';
import {getCurrentChannel, setCurrentChannel} from '../../utils/channel.js';
import watcher from '../../watcher.js';

import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';

const category = {
  id: EmoteCategories.BETTERTTV_CHANNEL,
  provider: EmoteProviders.BETTERTTV,
  displayName: formatMessage({defaultMessage: 'BetterTTV Channel Emotes'}),
};

function validChannelDestination(channel) {
  const currentChannel = getCurrentChannel();
  const [provider, providerId] = deserializeSocketChannel(channel);
  return currentChannel.id === providerId && currentChannel.provider === provider;
}

function createEmote(id, code, animated, user) {
  return new Emote({
    id,
    category,
    channel: user || getCurrentChannel(),
    code,
    images: {
      '1x': cdn.emoteUrl(id, '1x'),
      '2x': cdn.emoteUrl(id, '2x'),
      '4x': cdn.emoteUrl(id, '3x'),
      '1x_static': animated ? cdn.emoteUrl(id, '1x', true) : undefined,
      '2x_static': animated ? cdn.emoteUrl(id, '2x', true) : undefined,
      '4x_static': animated ? cdn.emoteUrl(id, '3x', true) : undefined,
    },
    animated,
  });
}

class ChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', (d) => this.updateChannelEmotes(d));

    socketClient.on(EventNames.EMOTE_CREATE, ({channel, emote}) => {
      if (!validChannelDestination(channel)) {
        return;
      }

      this.emotes.set(emote.code, createEmote(emote.id, emote.code, emote.animated, emote.user));

      watcher.emit('emotes.updated');
      watcher.emit(
        'chat.send_admin_message',
        formatMessage(
          {defaultMessage: 'BetterTTV Emotes: {emoteCode} has been added to chat'},
          {emoteCode: `${emote.code} \u200B \u200B${emote.code}\u200B`}
        )
      );
    });

    socketClient.on(EventNames.EMOTE_UPDATE, ({channel, ...payload}) => {
      if (!validChannelDestination(channel)) {
        return;
      }

      const emote = this.getEligibleEmoteById(payload.emote.id);
      if (emote == null) {
        return;
      }

      this.emotes.delete(emote.code);

      const newEmote = {...emote, ...payload.emote};
      this.emotes.set(newEmote.code, createEmote(newEmote.id, newEmote.code, newEmote.animated, newEmote.user));

      watcher.emit('emotes.updated');
    });

    socketClient.on(EventNames.EMOTE_DELETE, ({channel, emoteId}) => {
      if (!validChannelDestination(channel)) {
        return;
      }

      const emote = this.getEligibleEmoteById(emoteId);
      if (emote == null) {
        return;
      }

      this.emotes.delete(emote.code);

      watcher.emit('emotes.updated');
      watcher.emit(
        'chat.send_admin_message',
        formatMessage(
          {defaultMessage: 'BetterTTV Emotes: {emoteCode} has been removed from chat'},
          {emoteCode: `\u200B${emote.code}\u200B`}
        )
      );
    });
  }

  get category() {
    return category;
  }

  updateChannelEmotes({avatar, channelEmotes, sharedEmotes}) {
    this.emotes.clear();

    const emotes = channelEmotes.concat(sharedEmotes);

    const updatedChannel = getCurrentChannel();
    setCurrentChannel({...updatedChannel, avatar});

    for (const emote of emotes) {
      this.emotes.set(emote.code, createEmote(emote.id, emote.code, emote.animated, emote.user));
    }

    setTimeout(() => watcher.emit('emotes.updated'), 0);
  }
}

export default new ChannelEmotes();
