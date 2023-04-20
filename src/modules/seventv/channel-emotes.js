import ReconnectingEventSource from 'reconnecting-eventsource';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import {createEmote, isOverlay} from './utils.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentChannel} from '../../utils/channel.js';
import formatMessage from '../../i18n/index.js';

const category = {
  id: EmoteCategories.SEVENTV_CHANNEL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Channel Emotes'}),
};

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
      .then(({emote_set: emoteSet}) => {
        const {emotes} = emoteSet ?? {};
        if (emotes == null) {
          return;
        }

        for (const {
          id,
          name: code,
          data: {listed, animated, owner, flags},
        } of emotes) {
          if (!listed && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES)) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner, category, isOverlay(flags)));
        }

        eventSource = new ReconnectingEventSource(
          `https://events.7tv.io/v3@emote_set.update<object_id=${encodeURIComponent(emoteSet.id)}>`
        );
        eventSource.addEventListener('dispatch', (event) => this.handleEventSourceUpdate(event));
      })
      .then(() => watcher.emit('emotes.updated'));
  }

  handleEventSourceUpdate(event) {
    const {type: eventType, body: eventBody} = JSON.parse(event.data);

    if (eventType !== 'emote_set.update') {
      return;
    }

    const {pushed, updated, pulled} = eventBody;
    const pushedItems = pushed ?? [];
    const updatedItems = updated ?? [];
    const pulledItems = pulled ?? [];

    for (const {key, value} of pushedItems) {
      if (key !== 'emotes') {
        continue;
      }

      const {
        id,
        name: code,
        data: {listed, animated, owner, flags},
      } = value;

      if (!listed && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES)) {
        continue;
      }

      this.emotes.set(code, createEmote(id, code, animated, owner, category, isOverlay(flags)));

      watcher.emit(
        'chat.send_admin_message',
        formatMessage(
          {defaultMessage: '7TV Emotes: {emoteCode} has been added to chat'},
          {emoteCode: `${code} \u200B \u200B${code}\u200B`}
        )
      );
    }

    for (const {key, value} of updatedItems) {
      if (key !== 'emotes') {
        continue;
      }

      const {
        id,
        name: code,
        data: {listed, animated, owner, flags},
      } = value;

      const existingEmote = this.getEligibleEmoteById(id);
      if (existingEmote == null) {
        return;
      }

      this.emotes.delete(existingEmote.code);

      if (!listed && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_UNLISTED_EMOTES)) {
        continue;
      }

      this.emotes.set(code, createEmote(id, code, animated, owner, category, isOverlay(flags)));
    }

    for (const {key, old_value: oldValue} of pulledItems) {
      if (key !== 'emotes') {
        continue;
      }

      const {id} = oldValue;

      const existingEmote = this.getEligibleEmoteById(id);
      if (existingEmote == null) {
        return;
      }

      this.emotes.delete(existingEmote.code);

      watcher.emit(
        'chat.send_admin_message',
        formatMessage(
          {defaultMessage: '7TV Emotes: {emoteCode} has been removed from chat'},
          {emoteCode: `\u200B${existingEmote.code}\u200B`}
        )
      );
    }

    watcher.emit('emotes.updated');
  }
}

export default new SevenTVChannelEmotes();
