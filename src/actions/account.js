import api from '@/utils/api';

export function updateSubscriptionBadge(badge, {signal} = {}) {
  return api.patch('account/subscription/badge', {body: {badge}, signal});
}

export function getSubscriptionBadgeEligibility() {
  return api.get('account/subscription/badge/eligibility');
}

export function updateSubscriptionBadgeId(badgeId, {signal} = {}) {
  return api.patch('account/subscription/badge', {body: {badgeId}, signal});
}

export function updateUsernameEffect(effect, {signal} = {}) {
  return api.patch('account/subscription/username_effect', {body: {effect}, signal});
}

export function getUsernameEffectEligibility() {
  return api.get('account/subscription/username_effect/eligibility');
}
