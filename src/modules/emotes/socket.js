import socketClient, {EventNames} from '../../socket-client.js';
import {getCurrentChannel} from '../../utils/channel.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import channelEmotes from './channel-emotes.js';

function validChannelDestination(channel) {
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
  if (!validChannelDestination(channel)) {
    return;
  }

  channelEmotes.setChannelEmote(emote);

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(`Emote: "${emote.code}" has been added.`);
});

socketClient.on(EventNames.EMOTE_UPDATE, ({channel, ...payload}) => {
  if (!validChannelDestination(channel)) {
    return;
  }

  const emote = channelEmotes.getEligibleEmoteById(payload.emote.id);

  if (emote == null) {
    return;
  }

  channelEmotes.deleteChannelEmote(emote.code);
  channelEmotes.setChannelEmote({...emote, ...payload.emote});

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(`Emote: "${emote.code}" renamed to "${payload.emote.code}".`);
});

socketClient.on(EventNames.EMOTE_DELETE, ({channel, emoteId}) => {
  if (!validChannelDestination(channel)) {
    return;
  }

  const emote = channelEmotes.getEligibleEmoteById(emoteId);

  if (emote == null) {
    return;
  }

  channelEmotes.deleteChannelEmote(emote.code);

  watcher.emit('emotes.updated');
  twitch.sendChatAdminMessage(`Emote: "${emote.code}" has been removed.`);
});
