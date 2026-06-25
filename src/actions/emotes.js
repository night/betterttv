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

// resolves (200) when the emote is in the user's channel set, throws (404) when it isn't — used to
// decide whether to offer "Add to Channel" or "Remove from Channel"
export async function getSharedEmote(emoteId, userId, emoteSetId) {
  return api.get(`emotes/${emoteId}/shared/${userId}/${emoteSetId ?? userId}`);
}

export async function removeSharedEmote(emoteId, userId, emoteSetId) {
  return api.delete(`emotes/${emoteId}/shared/${userId}/${emoteSetId ?? userId}`);
}

export async function addPersonalEmote(emoteId, userId) {
  return api.put(`emotes/${emoteId}/personal/${userId}`);
}

// resolves (200) when the emote is in the user's personal set, throws (404) when it isn't
export async function getPersonalEmote(emoteId, userId) {
  return api.get(`emotes/${emoteId}/personal/${userId}`);
}

export async function removePersonalEmote(emoteId, userId) {
  return api.delete(`emotes/${emoteId}/personal/${userId}`);
}

export async function searchSharedEmotes(query) {
  return api.get('emotes/shared/search', {searchParams: {query, offset: 0, limit: 12}});
}
