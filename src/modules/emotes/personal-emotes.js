import socketClient from '../../socket-client.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import cdn from '../../utils/cdn.js';
import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';

const provider = {
  id: 'bttv-personal',
  displayName: 'BetterTTV Personal Emotes',
  badge: cdn.url('tags/developer.png'),
};

let joinedChannel;

class PersonalEmotes extends AbstractEmotes {
  constructor() {
    super();

    socketClient.on('lookup_user', (s) => this.updatePersonalEmotes(s));
    watcher.on('load.chat', () => this.joinChannel());
    watcher.on('conversation.new', (threadId) => this.joinConversation(threadId));
    watcher.on('conversation.message', (threadId, $el, msgObject) => this.broadcastMeConversation(threadId, msgObject));
  }

  get provider() {
    return provider;
  }

  getEmotes(user) {
    if (!user) return [];

    const emotes = this.emotes.get(user.name);
    if (!emotes) return [];

    return [...emotes.values()];
  }

  getEligibleEmote(code, user) {
    if (!user) return null;

    const emotes = this.emotes.get(user.name);
    if (!emotes) return null;

    return emotes.get(code);
  }

  joinChannel() {
    const currentChannel = twitch.getCurrentChannel();
    if (!currentChannel) return;

    const {name} = currentChannel;

    if (name !== joinedChannel) {
      socketClient.partChannel(joinedChannel);
    }

    joinedChannel = name;
    socketClient.joinChannel(name);
  }

  joinConversation(threadId) {
    if (!threadId) return;

    const user = twitch.getCurrentUser();
    if (!user) return;

    socketClient.joinChannel(threadId);
  }

  broadcastMeConversation(threadId, msgObject) {
    const user = twitch.getCurrentUser();
    if (!user || !msgObject.from || msgObject.from.id !== user.id || !threadId) return;

    socketClient.broadcastMe(threadId);
  }

  updatePersonalEmotes({name, pro, emotes}) {
    if (!pro) return;

    let personalEmotes = this.emotes.get(name);
    if (!personalEmotes) {
      personalEmotes = new Map();
      this.emotes.set(name, personalEmotes);
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
          provider: this.provider,
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
      watcher.emit('emotes.updated', name);
    }
  }
}

export default new PersonalEmotes();
