import api from '../utils/api.js';

export async function getCachedBadges(platform) {
  return api.get(`cached/badges/${platform}`);
}
