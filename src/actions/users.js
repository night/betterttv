import api from '@/utils/api';

export async function getCachedUser(provider, userId) {
  return api.get(`cached/users/${provider}/${userId}`);
}

export async function getUserSubscriptionBadgeEligibility(userId) {
  return api.get(`users/${userId}/subscription_badge/eligibility`);
}

export async function updateUserSubscriptionBadge(userId, badgeId, {signal} = {}) {
  return api.patch(`users/${userId}/subscription_badge`, {body: {badgeId}, signal});
}
