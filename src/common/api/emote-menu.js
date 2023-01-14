import formatMessage from '../../i18n/index.js';
import Emote from '../../modules/emotes/emote.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';

function serializeProvider({providerId, global = true}) {
  const provider = emoteMenuViewStore.getRegisteredProvider(providerId);
  if (provider == null) {
    throw new Error('Provider does not exist');
  }
  const {displayName} = provider;
  return {
    id: global ? `${providerId}-global` : `${providerId}-channel`,
    displayName: global
      ? formatMessage({defaultMessage: '{displayName} Global Emotes'}, {displayName})
      : formatMessage({defaultMessage: '{displayName} Channel Emotes'}, {displayName}),
  };
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

  upsertCategory({providerId, emotes: providerEmotes = [], channelId = null}) {
    const {id, displayName} = serializeProvider({providerId, global: channelId == null});
    if (providerEmotes.length == null || providerEmotes.length === 0 || !Array.isArray(providerEmotes)) {
      throw new Error('Emotes must be an array of emotes');
    }

    const parsedEmotes = providerEmotes.map((emote) => {
      if (emote.id == null || emote.id.length === 0 || typeof emote.id !== 'string') {
        throw new Error('Emote ID must be a non-empty string');
      }

      if (emote.code == null || emote.code.length === 0 || typeof emote.code !== 'string') {
        throw new Error('Emote code must be a non-empty string');
      }

      if (emote.animated !== true && emote.animated !== false) {
        throw new Error('Emote animated must be a boolean');
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

      if (emote.animated && (emote.images['1x_static'] == null || emote.images['1x_static'].length === 0)) {
        throw new Error('Emote must have a 1x_static image');
      }

      if (emote.animated && (emote.images['2x_static'] == null || emote.images['2x_static'].length === 0)) {
        throw new Error('Emote must have a 2x_static image');
      }

      if (emote.animated && (emote.images['4x_static'] == null || emote.images['4x_static'].length === 0)) {
        throw new Error('Emote must have a 4x_static image');
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
        animated: emote.animated,
        images: {
          '1x': new URL(emote.images['1x']).toString(),
          '2x': new URL(emote.images['2x']).toString(),
          '4x': new URL(emote.images['4x']).toString(),
          '1x_static': new URL(emote.images['1x_static']).toString(),
          '2x_static': new URL(emote.images['2x_static']).toString(),
          '4x_static': new URL(emote.images['4x_static']).toString(),
        },
      });
    });

    emoteMenuViewStore.upsertRegisteredProviderCategory({id, providerId, emotes: parsedEmotes, displayName, channelId});
  },

  deleteCategory({providerId, channelId}) {
    const category = serializeProvider({providerId, global: channelId == null});
    emoteMenuViewStore.deleteRegisteredProviderCategory(category.id);
  },
};
