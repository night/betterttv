import twitch from '../../../utils/twitch.js';
import watcher from '../../../watcher.js';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import dom from '../../../observers/dom.js';
import emotes from '../../emotes/index.js';
import {createSrcSet} from '../../../utils/image.js';
import {SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';
import './styles.module.css';

const EMOTE_SET_CODE_PREFIX = '__bttv-';
const AUTOCOMPLETE_MATCH_IMAGE_QUERY = '.emote-autocomplete-provider__image';

function seralizeCode(code) {
  return `${EMOTE_SET_CODE_PREFIX}${code}`;
}

function deseralizeCode(code) {
  if (!code.startsWith(EMOTE_SET_CODE_PREFIX)) {
    return null;
  }

  return code.replace(EMOTE_SET_CODE_PREFIX, '');
}

function getAutocompleteEmoteProvider() {
  const autocompleteNode = twitch.getAutocompleteProviders();
  const autocompleteProviders = autocompleteNode.stateNode.providers;

  return autocompleteProviders.find(({autocompleteType}) => autocompleteType === 'emote');
}

function createTwitchEmoteSet({category, emotes: categoryEmotes}) {
  return {
    emotes: categoryEmotes.map(({code}) => ({
      id: seralizeCode(code),
      modifiers: null,
      setID: category.id,
      token: code,
    })),
    id: category.id,
  };
}

async function injectEmoteSets() {
  const autocompleteEmoteProvider = getAutocompleteEmoteProvider();
  const emoteCategories = emoteMenuViewStore.getProvidersCategories();

  for (const category of emoteCategories) {
    if (category.emotes.length === 0) {
      continue;
    }

    const emoteSet = createTwitchEmoteSet(category);
    const index = autocompleteEmoteProvider.props.emotes.findIndex(({id}) => id === category.category.id);

    if (index === -1) {
      autocompleteEmoteProvider.props.emotes.push(emoteSet);
    } else {
      autocompleteEmoteProvider.props.emotes[index] = emoteSet;
    }
  }

  autocompleteEmoteProvider.forceUpdate();

  const autocompleteNode = twitch.getAutocompleteProviders();
  autocompleteNode.stateNode.forceUpdate();
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
    image.src = emote.images['1x'];
  }

  async unload() {
    cleanup();
    cleanup = null;

    const autocompleteEmoteProvider = getAutocompleteEmoteProvider();
    const emoteCategories = emoteMenuViewStore.getProvidersCategories().map(({category}) => category.id);

    autocompleteEmoteProvider.props.emotes = autocompleteEmoteProvider.props.emotes.filter(
      ({id}) => !emoteCategories.includes(id)
    );
  }

  load() {
    if (cleanup != null) {
      if (!settings.get(SettingIds.EMOTE_AUTOCOMPLETE)) {
        this.unload();
      }

      return;
    }

    const emoteAutocompleteProvider = getAutocompleteEmoteProvider();
    const oldComponentDidUpdate = emoteAutocompleteProvider.componentDidUpdate;

    emoteAutocompleteProvider.componentDidUpdate = function componentDidUpdate(prevProps) {
      console.log(prevProps, this.props);
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
