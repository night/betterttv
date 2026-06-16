import api from '@/utils/api';

export async function getCachedUser(provider, userId) {
  return api.get(`cached/users/${provider}/${userId}`);
}
