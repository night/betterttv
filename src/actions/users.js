import api from '../utils/api.js';

export async function getCachedUser(provider, userId) {
  return api.get(`cached/users/${provider}/${userId}`);
}
