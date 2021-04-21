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

function getThreadId($el) {
  return $el.attr('data-a-target').split('-').pop();
}

class PersonalEmotes extends AbstractEmotes {
  constructor() {
    super();

    socketClient.on('lookup_user', (s) => this.updatePersonalEmotes(s));
    watcher.on('load.chat', () => this.joinChannel());
    watcher.on('conversation.new', ($el) => this.joinConversation($el));
    watcher.on('conversation.message', ($el, msgObject) => this.broadcastMeConversation($el, msgObject));
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
    if (!user) return false;

    const emotes = this.emotes.get(user.name);
    if (!emotes) return false;

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

  joinConversation($el) {
    const user = twitch.getCurrentUser();
    if (!user) return;

    const threadId = getThreadId($el);
    if (!threadId) return;

    socketClient.joinChannel(threadId);
  }

  broadcastMeConversation($el, msgObject) {
    const user = twitch.getCurrentUser();
    if (!user || !msgObject.from || msgObject.from.id !== user.id) return;

    const threadId = getThreadId($el.closest('.whispers-thread'));
    if (!threadId) return;

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
