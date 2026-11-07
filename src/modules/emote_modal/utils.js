import {EmoteCategories, EmoteProviders} from '@/constants';

// only BetterTTV emotes can be added, and emoji/global ones are already available everywhere
export function canAddEmote(emote) {
  return (
    emote.category?.provider === EmoteProviders.BETTERTTV &&
    emote.category?.id !== EmoteCategories.BETTERTTV_GLOBAL &&
    emote.category?.id !== EmoteCategories.BETTERTTV_EMOJI
  );
}
