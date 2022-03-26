import twitch from '../../../utils/twitch.js';
import watcher from '../../../watcher.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import dom from '../../../observers/dom.js';
import emotes from '../../emotes/index.js';
import {createSrcSet} from '../../../utils/image.js';
import {SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';

const EMOTE_SET_CODE_PREFIX = '__bttv-';
const AUTOCOMPLETE_MATCH_IMAGE_QUERY = 'div[data-test-selector="autocomplete-match-list-matches"] img';

function seralizeCode(code) {
  return `${EMOTE_SET_CODE_PREFIX}${code}`;
}

function deseralizeCode(code) {
  if (!code.startsWith(EMOTE_SET_CODE_PREFIX)) {
    return null;
  }

  return code.replace(EMOTE_SET_CODE_PREFIX, '');
}

function createTwitchEmoteSet({category, emotes: categoryEmotes}) {
  return {
    __typename: 'EmoteSet',
    emotes: categoryEmotes.map(({code}) => ({
      __typename: 'Emote',
      id: seralizeCode(code),
      modifiers: null,
      setID: category.id,
      token: code,
    })),
    id: category.id,
  };
}

let cleanup = null;
export default class EmoteAutocomplete {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  // on chat load, add emotes to twitch's autocomplete emote provider
  // on autocomplete match render, replace image source of betterttv emotes with bttv cdn links

  patchEmoteImage(image, isConnected) {
    if (!isConnected) {
      return;
    }

    const match = String(image.srcset).match(/v2\/(.*?)\/default/);
    const deseralizedCode = deseralizeCode(match[1]);
    if (deseralizedCode == null) {
      return;
    }

    const emote = emotes.getEligibleEmote(deseralizedCode);
    if (emote == null) {
      return;
    }

    image.srcset = createSrcSet(emote.images);
  }

  async injectEmoteSets() {
    const autocompleteProviders = await twitch.getAutocompleteProviders();
    if (autocompleteProviders == null) {
      return;
    }

    const autocompleteEmoteProvider = autocompleteProviders.find(({autocompleteType}) => autocompleteType === 'emote');
    const emoteCategories = emoteMenuViewStore.getProvidersCategories();

    for (const category of emoteCategories) {
      if (category.emotes.length === 0) {
        continue;
      }

      const emoteSet = createTwitchEmoteSet(category);
      const index = autocompleteEmoteProvider.props.emotes.findIndex(({id}) => id === category.id);

      if (index === -1) {
        autocompleteEmoteProvider.props.emotes.push(emoteSet);
      } else {
        autocompleteEmoteProvider.props.emotes[index] = emoteSet;
      }
    }
  }

  async unload() {
    cleanup();
    cleanup = null;

    const autocompleteProviders = await twitch.getAutocompleteProviders();
    if (autocompleteProviders == null) {
      return;
    }

    const autocompleteEmoteProvider = autocompleteProviders.find(({autocompleteType}) => autocompleteType === 'emote');
    const emoteCategories = emoteMenuViewStore.getProvidersCategories().map(({category}) => category.id);

    autocompleteEmoteProvider.props.emotes = autocompleteEmoteProvider.props.emotes.filter(
      ({id}) => !emoteCategories.includes(id)
    );
  }

  load() {
    if (cleanup != null) {
      if (!settings.get(SettingIds.EMOTE_AUTOCOMPLETE)) {
        console.log(settings.get(SettingIds.EMOTE_AUTOCOMPLETE));
        this.unload();
      }

      return;
    }

    const dirtyCallback = () => {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStore.once('updated', () => this.injectEmoteSets());
      } else {
        this.injectEmoteSets();
      }
    };

    dirtyCallback();

    const storeCallbackCleanup = emoteMenuViewStore.on('dirty', dirtyCallback);
    const patchImageCallbackCleanup = dom.on(AUTOCOMPLETE_MATCH_IMAGE_QUERY, this.patchEmoteImage);

    cleanup = () => {
      storeCallbackCleanup();
      patchImageCallbackCleanup();
    };
  }

  isActive() {
    return false;
  }
}
