import {getEmoteDetails} from '@/actions/emotes';
import {EmoteProviders} from '@/constants';

// Resolves {createdAt, user} for the emote modal. BetterTTV is fetched from its API (the result is
// cached by react-query); 7TV and FrankerFaceZ data is captured on the emote when it's loaded.
export async function getEmoteModalDetails(emote) {
  const provider = emote.category?.provider;

  if (provider === EmoteProviders.BETTERTTV) {
    const details = await getEmoteDetails(emote.id).catch(() => null);
    return {createdAt: details?.createdAt ?? null, user: details?.user ?? null};
  }

  if (provider === EmoteProviders.SEVENTV) {
    const createdAt = emote.metadata?.createdAt;
    return {createdAt: createdAt != null ? new Date(createdAt).toISOString() : null, user: emote.channel ?? null};
  }

  return {createdAt: null, user: emote.channel ?? null};
}
