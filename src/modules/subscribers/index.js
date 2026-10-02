import socketClient, {EventNames} from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';

const users = new Map();

function updateSubscription({providerId, subscribed, badge, usernameEffect, usernameHoverEffect}) {
  users.set(providerId, {
    badge,
    subscribed,
    usernameEffect,
    usernameHoverEffect,
  });
}

// the current user's effects come from the auth store so their own changes apply instantly
function getEffectSource(providerId) {
  const platformUser = getCurrentUser();
  const authUser = useAuthStore.getState().user;

  if (platformUser != null && authUser != null && platformUser.id === providerId) {
    return authUser;
  }

  return users.get(providerId);
}

function legacyNewSubscriber({user}) {
  if (getCurrentChannel().name !== 'night') {
    return;
  }

  twitch.sendChatAdminMessage(`${user} just subscribed!`);
}

class SubscribersModule {
  constructor() {
    socketClient.on(EventNames.LOOKUP_USER, (d) => updateSubscription(d));
    socketClient.on(EventNames.NEW_SUBSCRIBER, (d) => legacyNewSubscriber(d));
  }

  getUsernameEffect(providerId) {
    return getEffectSource(providerId)?.usernameEffect ?? null;
  }

  getUsernameHoverEffect(providerId) {
    return getEffectSource(providerId)?.usernameHoverEffect ?? null;
  }

  hasLegacySubscription(providerId) {
    return users.get(providerId)?.subscribed ?? false;
  }

  hasSubscription(providerId) {
    return users.get(providerId) != null;
  }

  getSubscriptionBadge(providerId) {
    return users.get(providerId)?.badge ?? null;
  }
}

export default new SubscribersModule();
