import socketClient, {EventNames} from '../../socket-client.js';
import twitch from '../../utils/twitch.js';

const users = new Map();

function updateSubscription({name, subscribed, glow}) {
  users.set(name, {
    subscribed,
    glow,
  });
}

function newSubscriber({user}) {
  users.set(user, {
    subscribed: true,
    glow: false,
  });

  twitch.sendChatAdminMessage(`${user} just subscribed!`);
}

class LegacySubscribersModule {
  constructor() {
    socketClient.on(EventNames.LOOKUP_USER, (d) => updateSubscription(d));
    socketClient.on(EventNames.NEW_SUBSCRIBER, (d) => newSubscriber(d));
  }

  hasGlow(name) {
    const user = users.get(name);
    return user ? user.glow : false;
  }

  hasSubscription(name) {
    const user = users.get(name);
    return user ? user.subscribed : false;
  }
}

export default new LegacySubscribersModule();
