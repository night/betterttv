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
