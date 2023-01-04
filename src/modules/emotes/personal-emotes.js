import socketClient, {EventNames} from '../../socket-client.js';
import watcher from '../../watcher.js';
import cdn from '../../utils/cdn.js';
import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';
import {getCurrentUser} from '../../utils/user.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {EmoteCategories, EmoteProviders} from '../../constants.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.BETTERTTV_PERSONAL,
  provider: EmoteProviders.BETTERTTV,
  displayName: formatMessage({defaultMessage: 'BetterTTV Personal Emotes'}),
};

let joinedChannel;

class PersonalEmotes extends AbstractEmotes {
  constructor() {
    super();

    socketClient.on(EventNames.LOOKUP_USER, (s) => this.updatePersonalEmotes(s));
    watcher.on('load.chat', () => this.joinChannel());
    watcher.on('load.youtube', () => this.joinChannel());
    watcher.on('load.user', () => this.broadcastMe());
    watcher.on('conversation.new', (threadId) => this.joinConversation(threadId));
    watcher.on('conversation.message', (threadId, $el, msgObject) => this.broadcastMeConversation(threadId, msgObject));
    watcher.on('youtube.message', (element, {data}) => {
      if (data.authorExternalChannelId !== getCurrentUser()?.id) {
        return;
      }
      this.broadcastMe();
    });
  }

  get category() {
    return category;
  }

  getEmotes(user) {
    if (!user) return [];

    const emotes = this.emotes.get(user.id);
    if (!emotes) return [];

    return [...emotes.values()];
  }

  getEligibleEmote(code, user) {
    if (!user) return null;

    const emotes = this.emotes.get(user.id);
    if (!emotes) return null;

    return emotes.get(code);
  }

  joinChannel() {
    const currentChannel = getCurrentChannel();
    if (!currentChannel) {
      return;
    }

    if (joinedChannel != null && currentChannel.id === joinedChannel.id) {
      return;
    }

    if (joinedChannel != null) {
      socketClient.partChannel(joinedChannel.provider, joinedChannel.id);
    }

    joinedChannel = currentChannel;
    socketClient.joinChannel(currentChannel.provider, currentChannel.id);
  }

  joinConversation(threadId) {
    if (!threadId) return;

    const user = getCurrentUser();
    if (!user) return;

    socketClient.joinChannel('twitch', threadId);
  }

  broadcastMe() {
    const currentChannel = getCurrentChannel();
    if (!currentChannel) {
      return;
    }

    socketClient.broadcastMe(currentChannel.provider, currentChannel.id);
  }

  broadcastMeConversation(threadId, msgObject) {
    const user = getCurrentUser();
    if (!user || !msgObject.from || msgObject.from.id !== user.id || !threadId) return;

    socketClient.broadcastMe('twitch', threadId);
  }

  updatePersonalEmotes({providerId, pro, emotes}) {
    if (!pro) return;

    let personalEmotes = this.emotes.get(providerId);
    if (!personalEmotes) {
      personalEmotes = new Map();
      this.emotes.set(providerId, personalEmotes);
    }

    let updated = false;
    emotes.forEach(({id, channel, code, imageType}) => {
      if (personalEmotes.has(code)) {
        return;
      }
      personalEmotes.set(
        code,
        new Emote({
          id,
          category: this.category,
          channel: {name: channel},
          code,
          images: {
            '1x': cdn.emoteUrl(id, '1x'),
            '2x': cdn.emoteUrl(id, '2x'),
            '4x': cdn.emoteUrl(id, '3x'),
          },
          imageType,
        })
      );
      updated = true;
    });

    if (updated) {
      watcher.emit('emotes.updated', providerId);
    }
  }
}

export default new PersonalEmotes();
