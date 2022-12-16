/* eslint-disable import/prefer-default-export */
// import {EmoteCategories, EmoteProviders} from '../../constants.js';
import {EmoteCategories, EmoteProviders} from '../../constants.js';
import Emote from '../../modules/emotes/emote.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

const RESERVED_EMOTE_PROVIDER_IDS = Object.values(EmoteProviders);
const RESERVED_EMOTE_CATEGORY_IDS = Object.values(EmoteCategories);

function registerProvider({id, provider, displayName, icon, emotes: providerEmotes = [], channel = null}) {
  if (id == null || id.length === 0) {
    throw new Error('Category ID must be a non-empty string');
  }

  if (provider == null || provider.length === 0) {
    throw new Error('Provider ID must be a non-empty string');
  }

  if (displayName == null || displayName.length === 0) {
    throw new Error('Display name must be a non-empty string');
  }

  if (channel != null && channel.length === 0) {
    throw new Error('Channel must be a non-empty string');
  }

  if (RESERVED_EMOTE_CATEGORY_IDS.includes(id)) {
    throw new Error(`Category ID ${id} is reserved`);
  }

  if (RESERVED_EMOTE_PROVIDER_IDS.includes(provider)) {
    throw new Error(`Provider ID ${id} is reserved`);
  }

  if (icon.src == null || icon.src.length === 0) {
    throw new Error('Icon must be an object with a src property');
  }

  if (icon.alt == null || icon.alt.length === 0) {
    throw new Error('Icon must be an object with an alt property');
  }

  if (providerEmotes.length == null || providerEmotes.length === 0) {
    throw new Error('Emotes must be an array of emotes');
  }

  const parsedProviderEmotes = providerEmotes.map((emote) => {
    if (emote.id == null || emote.id.length === 0) {
      throw new Error('Emote ID must be a non-empty string');
    }

    if (emote.code == null || emote.code.length === 0) {
      throw new Error('Emote code must be a non-empty string');
    }

    if (emote.images['1x'] == null || emote.images['1x'].length === 0) {
      throw new Error('Emote must have a 1x image');
    }

    return new Emote({
      id: emote.id,
      category: {
        id,
        provider,
        displayName,
      },
      channel,
      code: emote.code,
      images: {
        '1x': emote.images['1x'],
        '2x': emote.images['2x'],
        '4x': emote.images['4x'],
      },
    });
  });

  emoteMenuViewStore.registerProvider({
    id,
    provider,
    displayName,
    icon,
    emotes: parsedProviderEmotes,
    channel,
  });
}

const emoteMenu = {
  registerProvider,
};

export default emoteMenu;
