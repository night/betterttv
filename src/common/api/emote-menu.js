import Emote from '../../modules/emotes/emote.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

function serializeProvider({providerId, global = true}) {
  const provider = emoteMenuViewStore.getRegisteredProvider(providerId);
  if (provider == null) {
    throw new Error('Provider does not exist');
  }
  const {displayName} = provider;
  return {
    id: (global ? `${displayName}-channel` : `${displayName}-global`).toLowerCase(),
    displayName: global ? `${displayName} Channel Emotes` : `${displayName} Global Emotes`,
  };
}

function upsertCategory({id, displayName, providerId, emotes: providerEmotes = [], channelId = null}) {
  if (providerEmotes.length == null || providerEmotes.length === 0) {
    throw new Error('Emotes must be an array of emotes');
  }

  const parsedEmotes = providerEmotes.map((emote) => {
    if (emote.id == null || emote.id.length === 0 || typeof emote.id !== 'string') {
      throw new Error('Emote ID must be a non-empty string');
    }

    if (emote.code == null || emote.code.length === 0 || typeof emote.code !== 'string') {
      throw new Error('Emote code must be a non-empty string');
    }

    if (emote.images['1x'] == null || emote.images['1x'].length === 0) {
      throw new Error('Emote must have a 1x image');
    }

    if (emote.images['2x'] == null || emote.images['2x'].length === 0) {
      throw new Error('Emote must have a 2x image');
    }

    if (emote.images['4x'] == null || emote.images['4x'].length === 0) {
      throw new Error('Emote must have a 4x image');
    }

    return new Emote({
      id: `${id}-${emote.id}`,
      category: {
        id,
        displayName,
        provider: providerId,
      },
      channel: channelId,
      code: emote.code,
      images: {
        '1x': new URL(emote.images['1x']).toString(),
        '2x': new URL(emote.images['2x']).toString(),
        '4x': new URL(emote.images['4x']).toString(),
      },
    });
  });

  emoteMenuViewStore.upsertRegisteredProviderCategory(id, {providerId, emotes: parsedEmotes, displayName, channelId});
}

export default {
  registerProvider({displayName, iconSrc}) {
    if (displayName == null || displayName.length === 0 || typeof displayName !== 'string') {
      throw new Error('Display name must be a non-empty string');
    }
    if (iconSrc == null || iconSrc.length === 0 || typeof iconSrc !== 'string') {
      throw new Error('Icon source must be a non-empty string');
    }
    return emoteMenuViewStore.registerProvider({displayName, iconSrc: new URL(iconSrc).toString()});
  },

  upsertGlobalCategory({providerId, emotes}) {
    upsertCategory({providerId, emotes, ...serializeProvider({providerId, global: true})});
  },

  upsertChannelCategory({providerId, emotes, channelId}) {
    if (channelId == null || channelId.length === 0 || typeof channelId !== 'string') {
      throw new Error('Channel ID must be a non-empty string');
    }
    upsertCategory({providerId, emotes, channelId, ...serializeProvider({providerId, global: false})});
  },

  deleteGlobalCategory({providerId}) {
    const category = serializeProvider({providerId, global: true});
    emoteMenuViewStore.deleteRegisteredProviderCategory({id: category.id});
  },

  deleteChannelCategory({providerId}) {
    const category = serializeProvider({providerId, global: false});
    emoteMenuViewStore.deleteRegisteredProviderCategory({id: category.id});
  },
};
