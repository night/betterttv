import ReconnectingEventSource from 'reconnecting-eventsource';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import AbstractEmotes from '../emotes/abstract-emotes.js';
import {createEmote, isUnlisted} from './utils.js';
import {EmoteCategories, EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import formatMessage from '../../i18n/index.js';

// 7TV global emotes can be found here: https://7tv.app/emote-sets/62cdd34e72a832540de95857
// they seem to be clean.

const category = {
  id: EmoteCategories.SEVENTV_CHANNEL,
  provider: EmoteProviders.SEVENTV,
  displayName: formatMessage({defaultMessage: '7TV Global Emotes'}),
};

let eventSource;

class SevenTVGlobalEmotes extends AbstractEmotes {
  constructor() {
    super();

    watcher.on('channel.updated', () => this.updateGlobalEmotes());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateGlobalEmotes());
  }

  get category() {
    return category;
  }

  updateGlobalEmotes() {
    if (eventSource != null) {
      try {
        eventSource.close();
      } catch (_) {}
    }

    this.emotes.clear();

    if (!hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.SEVENTV_EMOTES)) return;

    fetch(`https://7tv.io/v3/emote-sets/62cdd34e72a832540de95857`)
      .then((response) => response.json())
      .then(({emotes: globalEmotes}) => {
        if (globalEmotes == null) {
          return;
        }

        for (const {
          id,
          name: code,
          data: {listed, animated, owner},
        } of globalEmotes) {
          if (!listed) {
            continue;
          }

          this.emotes.set(code, createEmote(id, code, animated, owner, category));
        }
      })
      .then(() => watcher.emit('emotes.updated'));

    // TODO figure this out.
    /*
    eventSource = new ReconnectingEventSource(
      `https://events.7tv.app/v1/emote-sets/62cdd34e72a832540de95857`
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
     */
  }
}

export default new SevenTVGlobalEmotes();
