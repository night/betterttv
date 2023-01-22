import twitch from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import dom from '../../../observers/dom.js';
import emotes from '../../emotes/index.js';
import {createSrcSet, createSrc} from '../../../utils/image.js';
import {EmoteCategories, EmoteTypeFlags, SettingIds} from '../../../constants.js';
import './EmoteAutocomplete.module.css';
import settings from '../../../settings.js';
import {hasFlag} from '../../../utils/flags.js';

const EMOTE_ID_BETTERTTV_PREFIX = '__BTTV__';
const CUSTOM_SET_ID = 'BETTERTTV_EMOTES';
const AUTOCOMPLETE_MATCH_IMAGE_QUERY = '.emote-autocomplete-provider__image, .chat-line__message--emote';

const PATCHED_SENTINEL = Symbol('patched symbol');

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

function injectEmoteSets(node, mutate = false) {
  const autocompleteEmotes = mutate ? node.props.emotes : [...node.props.emotes];
  node.props.emotes = autocompleteEmotes;

  const allEmotes = emotes.getEmotesByCategories([
    EmoteCategories.BETTERTTV_CHANNEL,
    EmoteCategories.BETTERTTV_GLOBAL,
    EmoteCategories.BETTERTTV_PERSONAL,
    EmoteCategories.FRANKERFACEZ_CHANNEL,
    EmoteCategories.FRANKERFACEZ_GLOBAL,
    EmoteCategories.SEVENTV_CHANNEL,
  ]);

  const emoteSet = createTwitchEmoteSet(allEmotes);
  const index = autocompleteEmotes.findIndex(({id}) => id === CUSTOM_SET_ID);

  if (index === -1) {
    autocompleteEmotes.push(emoteSet);
  } else {
    autocompleteEmotes[index] = emoteSet;
  }
}

function patchEmoteImage(image, isConnected) {
  if (!isConnected) {
    return;
  }

  const url = String(image.srcset || image.src);
  const deseralizedEmote = deserializeEmoteFromURL(url);

  if (deseralizedEmote == null) {
    return;
  }

  const emote = emotes.getEligibleEmote(deseralizedEmote.code, getCurrentUser());
  if (emote == null) {
    return;
  }

  const emotesSettingValue = settings.get(SettingIds.EMOTES);
  const showAnimatedEmotes =
    emote.category.id === EmoteCategories.BETTERTTV_PERSONAL
      ? hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES)
      : hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_EMOTES);
  const shouldRenderStatic = emote.animated && !showAnimatedEmotes;

  if (image.srcset) {
    image.srcset = createSrcSet(emote.images, shouldRenderStatic);
  }
  if (image.src) {
    image.src = createSrc(emote.images, shouldRenderStatic);
  }

  if (shouldRenderStatic) {
    image.addEventListener('mouseenter', () => {
      if (image.srcset) {
        image.srcset = createSrcSet(emote.images, false);
      }
      if (image.src) {
        image.src = createSrc(emote.images, false);
      }
    });
    image.addEventListener('mouseleave', () => {
      if (image.srcset) {
        image.srcset = createSrcSet(emote.images, true);
      }
      if (image.src) {
        image.src = createSrc(emote.images, true);
      }
    });
  }
}

let twitchAutocompleteComponentDidUpdate = null;
let twitchEditorComponentDidUpdate = null;
export default class EmoteAutocomplete {
  constructor() {
    this.load();
    watcher.on('channel.updated', () => this.load());
    watcher.on('emotes.updated', () => this.load());
    dom.on(AUTOCOMPLETE_MATCH_IMAGE_QUERY, patchEmoteImage, {
      attributes: true,
      attributeFilter: ['src', 'srcset'],
    });
  }

  load() {
    const emoteAutocompleteProvider = getAutocompleteEmoteProvider();
    if (emoteAutocompleteProvider != null && emoteAutocompleteProvider.__bttvAutocompletePatched !== PATCHED_SENTINEL) {
      emoteAutocompleteProvider.__bttvAutocompletePatched = PATCHED_SENTINEL;
      twitchAutocompleteComponentDidUpdate = emoteAutocompleteProvider.componentDidUpdate;

      // eslint-disable-next-line no-inner-declarations
      function bttvComponentDidUpdate(prevProps) {
        if (prevProps.emotes !== this.props.emotes) {
          injectEmoteSets(emoteAutocompleteProvider);
        }

        if (twitchAutocompleteComponentDidUpdate != null) {
          twitchAutocompleteComponentDidUpdate.call(this, ...prevProps);
        }
      }

      emoteAutocompleteProvider.componentDidUpdate = bttvComponentDidUpdate;
      emoteAutocompleteProvider.forceUpdate();
    } else if (emoteAutocompleteProvider != null) {
      injectEmoteSets(emoteAutocompleteProvider);
    }

    const chatInputEditor = twitch.getChatInputEditor();
    if (chatInputEditor != null && chatInputEditor.__bttvAutocompletePatched !== PATCHED_SENTINEL) {
      chatInputEditor.__bttvAutocompletePatched = PATCHED_SENTINEL;
      twitchEditorComponentDidUpdate = chatInputEditor.componentDidUpdate;

      // eslint-disable-next-line no-inner-declarations
      function bttvComponentDidUpdate(prevProps) {
        if (prevProps.emotes !== this.props.emotes) {
          injectEmoteSets(chatInputEditor, true);
          this.forceUpdate();
        }

        if (twitchEditorComponentDidUpdate != null) {
          twitchEditorComponentDidUpdate.call(this, ...prevProps);
        }
      }

      chatInputEditor.componentDidUpdate = bttvComponentDidUpdate;
      chatInputEditor.forceUpdate();
    } else if (chatInputEditor != null) {
      injectEmoteSets(chatInputEditor, true);
    }
  }
}
