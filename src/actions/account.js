import api from '@/utils/api';

export function updateSubscriptionBadge(badge) {
  return api.patch('account/subscription/badge', {body: {badge}});
}
