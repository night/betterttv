import api from '@/utils/api';

export async function getCachedBadges(platform) {
  return api.get(`cached/badges/${platform}`);
}
