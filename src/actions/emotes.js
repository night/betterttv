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

export async function addSharedEmote(emoteId, userId) {
  // the user's id doubles as their default channel emote set's id
  return api.put(`emotes/${emoteId}/shared/${userId}/${userId}`);
}

export async function addPersonalEmote(emoteId, userId) {
  return api.put(`emotes/${emoteId}/personal/${userId}`);
}

export async function getEmoteAvailability(emoteId) {
  return api.get(`emotes/${emoteId}/availability`);
}
