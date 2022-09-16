import socketClient, {EventNames} from '../../socket-client.js';
import {getCurrentChannel} from '../../utils/channel.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import channelEmotes from './channel-emotes.js';

function validateChannelDestination(channel) {
  const currentChannel = getCurrentChannel();
  const [provider, providerId] = channel.split(':');

  if (currentChannel.id !== providerId) {
    return false;
  }

  if (currentChannel.provider !== provider) {
    return false;
  }

  return true;
}

socketClient.on(EventNames.EMOTE_CREATE, ({channel, emote}) => {
  if (!validateChannelDestination(channel)) {
    return;
  }

  channelEmotes.setChannelEmote(emote);

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(`Emote: "${emote.code}" has been added.`);
});

socketClient.on(EventNames.EMOTE_UPDATE, ({channel, mutatedFields, ...payload}) => {
  if (!validateChannelDestination(channel)) {
    return;
  }

  const emote = channelEmotes.getEligibleEmoteById(payload.emote.id);

  if (emote == null) {
    return;
  }

  channelEmotes.deleteChannelEmote(emote.code);
  channelEmotes.setChannelEmote({...emote, ...mutatedFields});

  watcher.emit('emotes.updated');

  for (const [key, value] of Object.entries(mutatedFields)) {
    // TODO: have specific messages for different mutated fields
    twitch.sendChatAdminMessage(`Emote: "${emote[key]}" renamed to "${value}".`);
  }
});

socketClient.on(EventNames.EMOTE_DELETE, ({channel, ...payload}) => {
  if (!validateChannelDestination(channel)) {
    return;
  }

  const emote = channelEmotes.getEligibleEmoteById(payload.emote.id);

  if (emote == null) {
    return;
  }

  channelEmotes.deleteChannelEmote(emote.code);

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(`Emote: "${emote.code}" has been removed.`);
});
