import {EmoteCategories, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';
import socketClient, {deserializeSocketChannel, EventNames} from '@/socket-client';
import cdn from '@/utils/cdn';
import {getCurrentChannel, setCurrentChannel} from '@/utils/channel';
import watcher from '@/watcher';

import AbstractEmotes from './abstract-emotes';
import Emote from './emote';

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

function formatAddedMessage(codes) {
  if (codes.length === 1) {
    const [code] = codes;
    return formatMessage(
      {defaultMessage: 'BetterTTV Emotes: {emoteCode} has been added to chat'},
      {emoteCode: `${code} \u200B \u200B${code}\u200B`}
    );
  }

  return formatMessage(
    {defaultMessage: 'BetterTTV Emotes: {count, plural, other {# emotes have}} been added to chat'},
    {count: codes.length}
  );
}

function formatRemovedMessage(codes) {
  if (codes.length === 1) {
    const [code] = codes;
    return formatMessage(
      {defaultMessage: 'BetterTTV Emotes: {emoteCode} has been removed from chat'},
      {emoteCode: `\u200B${code}\u200B`}
    );
  }

  return formatMessage(
    {defaultMessage: 'BetterTTV Emotes: {count, plural, other {# emotes have}} been removed from chat'},
    {count: codes.length}
  );
}

class ChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', (d) => this.updateChannelEmotes(d));

    socketClient.on(EventNames.EMOTE_CREATE, ({channel, emote}) => this.updateEmotes(channel, {added: [emote]}));
    socketClient.on(EventNames.EMOTE_UPDATE, ({channel, emote}) => this.updateEmotes(channel, {updated: [emote]}));
    socketClient.on(EventNames.EMOTE_DELETE, ({channel, emoteId}) => this.updateEmotes(channel, {removed: [emoteId]}));
    socketClient.on(EventNames.EMOTES_UPDATE, ({channel, ...changes}) => this.updateEmotes(channel, changes));
  }

  // removals go first, so an emote removed and added back in the same update stays
  updateEmotes(channel, {added = [], removed = [], updated = []}) {
    if (!validChannelDestination(channel)) {
      return;
    }

    const removedCodes = [];
    for (const emoteId of removed) {
      const emote = this.getEligibleEmoteById(emoteId);
      if (emote == null) {
        continue;
      }

      this.emotes.delete(emote.code);
      removedCodes.push(emote.code);
    }

    let renamed = false;
    for (const update of updated) {
      const emote = this.getEligibleEmoteById(update.id);
      if (emote == null) {
        continue;
      }

      this.emotes.delete(emote.code);
      const {id, code, animated, user} = {...emote, ...update};
      this.emotes.set(code, createEmote(id, code, animated, user ?? emote.channel));
      renamed = true;
    }

    const addedCodes = [];
    for (const emote of added) {
      // a repeated event for an emote that's already here changes nothing
      if (this.emotes.get(emote.code)?.id === emote.id) {
        continue;
      }

      this.emotes.set(emote.code, createEmote(emote.id, emote.code, emote.animated, emote.user));
      addedCodes.push(emote.code);
    }

    if (removedCodes.length === 0 && addedCodes.length === 0 && !renamed) {
      return;
    }

    watcher.emit('emotes.updated');

    if (removedCodes.length > 0) {
      watcher.emit('chat.send_admin_message', formatRemovedMessage(removedCodes));
    }

    if (addedCodes.length > 0) {
      watcher.emit('chat.send_admin_message', formatAddedMessage(addedCodes));
    }
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
