import api from '@/utils/api';

export function updateSubscriptionBadge(badge, {signal} = {}) {
  return api.patch('account/subscription/badge', {body: {badge}, signal});
}

export function updateSubscriptionBadgeId(badgeId, {signal} = {}) {
  return api.patch('account/subscription/badge', {body: {badgeId}, signal});
}

export function updateUsernameEffect(effect, {signal} = {}) {
  return api.patch('account/subscription/username_effect', {body: {effect}, signal});
}

export function updateUsernameHoverEffect(effect, {signal} = {}) {
  return api.patch('account/subscription/username_hover_effect', {body: {effect}, signal});
}

export function getFeatureEligibility() {
  return api.get('account/subscription/feature_eligibility');
}
