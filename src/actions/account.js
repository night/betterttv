import api from '@/utils/api';

export function updateSubscriptionBadge(badge, {signal} = {}) {
  return api.patch('account/subscription/badge', {body: {badge}, signal});
}
