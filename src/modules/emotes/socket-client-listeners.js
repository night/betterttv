import socketClient, {deserializeSocketChannel, EventNames} from '../../socket-client.js';
import {getCurrentChannel} from '../../utils/channel.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import channelEmotes from './channel-emotes.js';

function validChannelDestination(channel) {
  const currentChannel = getCurrentChannel();
  const [provider, providerId] = deserializeSocketChannel(channel);
  return currentChannel.id === providerId && currentChannel.provider === provider;
}

socketClient.on(EventNames.EMOTE_CREATE, ({channel, emote}) => {
  if (!validChannelDestination(channel)) {
    return;
  }

  channelEmotes.upsertChannelEmote(emote);

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(
    `BetterTTV Emotes: ${emote.code} \u200B \u200B${emote.code}\u200B has been added to chat`,
    true
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
  twitch.sendChatAdminMessage(`BetterTTV Emotes: \u200B${emote.code}\u200B has been removed from chat`, true);
});
