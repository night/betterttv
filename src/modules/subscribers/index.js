import socketClient, {EventNames} from '../../socket-client.js';
import {getCurrentChannel} from '../../utils/channel.js';
import twitch from '../../utils/twitch.js';

const users = new Map();

function updateSubscription({providerId, subscribed, glow, badge}) {
  users.set(providerId, {
    badge,
    subscribed,
    glow,
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

  hasGlow(providerId) {
    return users.get(providerId)?.glow ?? false;
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
