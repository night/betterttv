import api from '@/utils/api';

export async function getCachedUser(provider, userId) {
  return api.get(`cached/users/${provider}/${userId}`);
}

// limited, the user's emotes are only what's live in chat; primaryEmoteSetId is the set live there
export async function getUser(userId) {
  return api.get(`users/${userId}`, {searchParams: {limited: true}});
}
