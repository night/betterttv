import socketClient, {EventNames} from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';

const users = new Map();

function updateSubscription({providerId, subscribed, badge, usernameEffect}) {
  users.set(providerId, {
    badge,
    subscribed,
    usernameEffect,
  });
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
    const platformUser = getCurrentUser();
    const authUser = useAuthStore.getState().user;

    if (platformUser != null && authUser != null && platformUser.id === providerId) {
      return authUser.usernameEffect ?? null;
    }

    return users.get(providerId)?.usernameEffect ?? null;
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
