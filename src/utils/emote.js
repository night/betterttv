import {EmoteProviders} from '@/constants';
import cdn from '@/utils/cdn';

// the per-provider constants the emote modal renders
export const EmoteProviderMetadata = {
  [EmoteProviders.BETTERTTV]: {
    displayName: 'BetterTTV',
    logoUrl: cdn.url('/assets/logos/bttv_logo.png'),
    emotePageUrl: 'https://betterttv.com/emotes/',
  },
  [EmoteProviders.FRANKERFACEZ]: {
    displayName: 'FrankerFaceZ',
    logoUrl: cdn.url('/assets/logos/ffz_logo.png'),
    emotePageUrl: 'https://www.frankerfacez.com/emote/',
  },
  [EmoteProviders.SEVENTV]: {
    displayName: '7TV',
    logoUrl: cdn.url('/assets/logos/7tv_logo.png'),
    emotePageUrl: 'https://7tv.app/emotes/',
  },
};

export function getCanonicalEmoteId(emoteId, emoteProvider) {
  return `${emoteProvider}-${emoteId}`;
}

// the emote's page on its provider's website, or null for providers without one
export function getEmotePageUrl(emoteId, emoteProvider) {
  const baseUrl = EmoteProviderMetadata[emoteProvider]?.emotePageUrl;
  if (baseUrl == null) {
    return null;
  }
  return `${baseUrl}${emoteId}`;
}
