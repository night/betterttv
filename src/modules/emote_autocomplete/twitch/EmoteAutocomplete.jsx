import twitch from '../../../utils/twitch.js';
import watcher from '../../../watcher.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import dom from '../../../observers/dom.js';
import emotes from '../../emotes/index.js';
import {createSrcSet} from '../../../utils/image.js';
import {EmoteCategories, SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';
import './styles.module.css';

const EMOTE_ID_BETTERTTV_PREFIX = '__BTTV__';
const CUSTOM_SET_ID = 'BETTERTTV_EMOTES';
const AUTOCOMPLETE_MATCH_IMAGE_QUERY = '.emote-autocomplete-provider__image, .chat-line__message--emote';

function serializeEmoteId(emote) {
  const data = `${emote.category.provider}-${emote.id}-${emote.code}`;
  return `${EMOTE_ID_BETTERTTV_PREFIX}${encodeURIComponent(btoa(data))}`;
}

function deserializeEmoteFromURL(url) {
  const emoteData = url.split(EMOTE_ID_BETTERTTV_PREFIX)[1]?.split('/')[0];
  if (emoteData == null) {
    return null;
  }
  try {
    const [emoteProvider, emoteId, emoteCode] = atob(decodeURIComponent(emoteData)).split('-');
    return {
      provider: emoteProvider,
      id: emoteId,
      code: emoteCode,
    };
  } catch (_) {
    return null;
  }
}

function getAutocompleteEmoteProvider() {
  const autocompleteNode = twitch.getAutocompleteStateNode();
  if (autocompleteNode == null) {
    return null;
  }

  const autocompleteProviders = autocompleteNode.stateNode.providers;
  return autocompleteProviders.find(({autocompleteType}) => autocompleteType === 'emote');
}

function createTwitchEmoteSet(allEmotes) {
  return {
    emotes: allEmotes.map((emote) => ({
      id: serializeEmoteId(emote),
      modifiers: null,
      setID: CUSTOM_SET_ID,
      token: emote.code,
    })),
    id: CUSTOM_SET_ID,
  };
}

async function injectEmoteSets() {
  const autocompleteEmoteProvider = getAutocompleteEmoteProvider();
  if (autocompleteEmoteProvider == null) {
    return;
  }

  const autocompleteEmotes = autocompleteEmoteProvider.props.emotes;

  const allEmotes = emotes.getEmotesByCategories([
    EmoteCategories.BETTERTTV_CHANNEL,
    EmoteCategories.BETTERTTV_GLOBAL,
    EmoteCategories.BETTERTTV_PERSONAL,
    EmoteCategories.FRANKERFACEZ_CHANNEL,
    EmoteCategories.FRANKERFACEZ_GLOBAL,
  ]);

  const emoteSet = createTwitchEmoteSet(allEmotes);
  const index = autocompleteEmotes.findIndex(({id}) => id === CUSTOM_SET_ID);

  if (index === -1) {
    autocompleteEmotes.push(emoteSet);
  } else {
    autocompleteEmotes[index] = emoteSet;
  }

  autocompleteEmoteProvider.forceUpdate();
}

let cleanup = null;
export default class EmoteAutocomplete {
  constructor() {
    watcher.on('channel.updated', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  patchEmoteImage(image, isConnected) {
    if (!isConnected) {
      return;
    }

    const url = String(image.srcset);
    const deseralizedEmote = deserializeEmoteFromURL(url);

    if (deseralizedEmote == null) {
      return;
    }

    const emote = emotes.getEligibleEmote(deseralizedEmote.code);
    if (emote == null) {
      return;
    }

    image.srcset = createSrcSet(emote.images);
    image.src = emote.images['1x'];
  }

  unload() {
    cleanup();
    cleanup = null;

    const autocompleteEmoteProvider = getAutocompleteEmoteProvider();
    if (autocompleteEmoteProvider == null) {
      return;
    }

    autocompleteEmoteProvider.props.emotes = autocompleteEmoteProvider.props.emotes.filter(
      ({id}) => id !== CUSTOM_SET_ID
    );

    autocompleteEmoteProvider.forceUpdate();
  }

  load() {
    if (cleanup != null) {
      this.unload();
    }

    if (!settings.get(SettingIds.EMOTE_AUTOCOMPLETE)) {
      return;
    }

    const emoteAutocompleteProvider = getAutocompleteEmoteProvider();
    if (emoteAutocompleteProvider == null) {
      return;
    }

    const oldComponentDidUpdate = emoteAutocompleteProvider.componentDidUpdate;
    emoteAutocompleteProvider.componentDidUpdate = function componentDidUpdate(prevProps) {
      if (prevProps.emotes !== this.props.emotes) {
        injectEmoteSets();
      }

      if (oldComponentDidUpdate != null) {
        oldComponentDidUpdate.call(this, ...prevProps);
      }
    };

    const dirtyCallback = () => {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStore.once('updated', () => injectEmoteSets());
      } else {
        injectEmoteSets();
      }
    };

    dirtyCallback();

    const storeCallbackCleanup = emoteMenuViewStore.on('dirty', dirtyCallback);
    const patchImageCallbackCleanup = dom.on(AUTOCOMPLETE_MATCH_IMAGE_QUERY, this.patchEmoteImage);

    cleanup = () => {
      storeCallbackCleanup();
      patchImageCallbackCleanup();
      emoteAutocompleteProvider.componentDidUpdate = oldComponentDidUpdate;
    };
  }

  isActive() {
    return false;
  }
}
