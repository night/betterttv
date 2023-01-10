/* eslint-disable import/prefer-default-export */
import {getCurrentChannel} from '../../utils/channel.js';
import socketClient, {EventNames, deserializeSocketChannel} from '../../socket-client.js';
import watcher from '../../watcher.js';
import channelEmotes from '../emotes/channel-emotes.js';
import formatMessage from '../../i18n/index.js';

function validChannelDestination(channel) {
  const currentChannel = getCurrentChannel();
  const [provider, providerId] = deserializeSocketChannel(channel);
  return currentChannel.id === providerId && currentChannel.provider === provider;
}

export default function emoteSocketListeners(sendMessage) {
  socketClient.on(EventNames.EMOTE_CREATE, ({channel, emote}) => {
    if (!validChannelDestination(channel)) {
      return;
    }

    channelEmotes.upsertChannelEmote(emote);

    watcher.emit('emotes.updated');
    sendMessage(
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

    const emote = channelEmotes.getEligibleEmoteById(payload.emote.id);
    if (emote == null) {
      return;
    }

    channelEmotes.emotes.delete(emote.code);
    channelEmotes.upsertChannelEmote({...emote, ...payload.emote});

    watcher.emit('emotes.updated');
  });

  socketClient.on(EventNames.EMOTE_DELETE, ({channel, emoteId}) => {
    if (!validChannelDestination(channel)) {
      return;
    }

    const emote = channelEmotes.getEligibleEmoteById(emoteId);
    if (emote == null) {
      return;
    }

    channelEmotes.emotes.delete(emote.code);

    watcher.emit('emotes.updated');
    sendMessage(
      formatMessage(
        {defaultMessage: 'BetterTTV Emotes: {emoteCode} has been removed from chat'},
        {emoteCode: `\u200B${emote.code}\u200B`}
      )
    );
  });
}
