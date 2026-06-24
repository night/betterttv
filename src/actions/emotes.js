import api from '@/utils/api';

export async function getGlobalEmotes() {
  return api.get('cached/emotes/global');
}

export async function getFrankerFaceZGlobalEmotes() {
  return api.get('cached/frankerfacez/emotes/global');
}

export async function getFrankerFaceZChannelEmotes(provider, userId) {
  return api.get(`cached/frankerfacez/users/${provider}/${userId}`);
}

export async function getEmoteDetails(emoteId) {
  return api.get(`emotes/${emoteId}`);
}

export async function addSharedEmote(emoteId, userId, emoteSetId) {
  // emoteSetId defaults to the user's id, which is their default channel emote set
  return api.put(`emotes/${emoteId}/shared/${userId}/${emoteSetId ?? userId}`);
}

export async function addPersonalEmote(emoteId, userId) {
  return api.put(`emotes/${emoteId}/personal/${userId}`);
}

export async function searchSharedEmotes(query) {
  return api.get('emotes/shared/search', {searchParams: {query, offset: 0, limit: 12}});
}
