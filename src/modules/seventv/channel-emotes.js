import ReconnectingEventSource from 'reconnecting-eventsource';
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

function createEmote(id, code, animated, owner) {
  return new Emote({
    id,
    category,
    channel: {
      id: owner.id,
      name: owner.username ?? owner.login,
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
  });
}

function isUnlisted(visibility) {
  return hasFlag(visibility, 1 << 2) || hasFlag(visibility, 1 << 8);
}

let eventSource;

class SevenTVChannelEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateChannelEmotes());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateChannelEmotes());
  }

  get category() {
    return category;
  }

  updateChannelEmotes() {
    if (eventSource != null) {
      try {
        eventSource.close();
      } catch (_) {}
    }

    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_EMOTES)) return;

    const currentChannel = getCurrentChannel();
    if (!currentChannel) return;

    fetch(
      `https://7tv.io/v3/users/${encodeURIComponent(currentChannel.provider)}/${encodeURIComponent(currentChannel.id)}`
    )
      .then((response) => response.json())
      .then(({emote_set: {emotes}}) => {
        if (emotes == null) {
          return;
        }

        for (const {
          id,
          name: code,
          data: {listed, animated, owner},
        } of emotes) {
          if (!listed) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner));
        }
      })
      .then(() => watcher.emit('emotes.updated'));

    eventSource = new ReconnectingEventSource(
      `https://events.7tv.app/v1/channel-emotes?channel=${encodeURIComponent(currentChannel.name)}`
    );
    eventSource.addEventListener('update', (event) => this.handleEventSourceUpdate(event));

    window.testUpdate = (event) => this.handleEventSourceUpdate(event);
  }

  handleEventSourceUpdate(event) {
    const {channel: channelName, emote_id: id, name: code, action, emote} = JSON.parse(event.data);

    const currentChannel = getCurrentChannel();
    if (!currentChannel) {
      return;
    }

    if (channelName !== currentChannel.name) {
      return;
    }

    let message;
    switch (action) {
      case 'ADD': {
        if (isUnlisted(emote.visibility)) {
          return;
        }

        this.emotes.set(code, createEmote(id, code, emote.animated, emote.owner));

        message = formatMessage(
          {defaultMessage: '7TV Emotes: {emoteCode} has been added to chat'},
          {emoteCode: `${code} \u200B \u200B${code}\u200B`}
        );
        break;
      }
      case 'UPDATE': {
        const existingEmote = this.getEligibleEmoteById(id);
        if (existingEmote == null) {
          return;
        }

        this.emotes.delete(existingEmote.code);

        if (isUnlisted(emote.visibility)) {
          return;
        }

        this.emotes.set(code, createEmote(id, code, emote.animated, emote.owner));
        break;
      }
      case 'REMOVE': {
        const existingEmote = this.getEligibleEmoteById(id);
        if (existingEmote == null) {
          return;
        }

        this.emotes.delete(existingEmote.code);

        message = formatMessage(
          {defaultMessage: '7TV Emotes: {emoteCode} has been removed from chat'},
          {emoteCode: `\u200B${existingEmote.code}\u200B`}
        );
        break;
      }
      default:
        return;
    }

    watcher.emit('emotes.updated');
    if (message != null) {
      watcher.emit('chat.send_admin_message', message);
    }
  }
}

export default new SevenTVChannelEmotes();
