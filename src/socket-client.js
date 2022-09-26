import throttle from 'lodash.throttle';
import SafeEventEmitter from './utils/safe-event-emitter.js';
import debug from './utils/debug.js';
import {getCurrentUser} from './utils/user.js';

const CONNECTION_STATES = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
};

export const EventNames = {
  LOOKUP_USER: 'lookup_user',
  NEW_SUBSCRIBER: 'new_subscriber',
  EMOTE_CREATE: 'emote_create',
  EMOTE_DELETE: 'emote_delete',
  EMOTE_UPDATE: 'emote_update',
};

const WEBSOCKET_ENDPOINT = 'wss://sockets.betterttv.net/ws';

let socket;
let state = CONNECTION_STATES.DISCONNECTED;
let attempts = 1;

const joinedChannels = [];

function makeSocketChannel(provider, providerId) {
  return `${provider}:${providerId}`;
}

export function deserializeSocketChannel(channel) {
  return channel.split(':');
}

class SocketClient extends SafeEventEmitter {
  constructor() {
    super();

    this.connect();

    this.broadcastMe = throttle(this.broadcastMe.bind(this), 1000, {leading: false});
  }

  connect() {
    if (state !== CONNECTION_STATES.DISCONNECTED) return;
    state = CONNECTION_STATES.CONNECTING;

    debug.log('SocketClient: Connecting to server');

    socket = new WebSocket(WEBSOCKET_ENDPOINT);

    socket.onopen = () => {
      debug.log('SocketClient: Connected to server');

      state = CONNECTION_STATES.CONNECTED;
      attempts = 1;

      if (joinedChannels.length) {
        joinedChannels.forEach((socketChannel) => {
          const [provider, providerId] = socketChannel.split(':');
          this.joinChannel(provider, providerId);
        });
      }
    };

    socket.onclose = () => {
      if (state === CONNECTION_STATES.DISCONNECTED) return;

      debug.log('SocketClient: Disconnected from server');

      attempts++;
      this.reconnect();
    };

    socket.onerror = socket.onclose;

    socket.onmessage = ({data}) => {
      let evt;

      try {
        evt = JSON.parse(data);
      } catch (e) {
        debug.log('SocketClient: Error parsing message', e);
        return;
      }

      debug.log('SocketClient: Received event', evt);

      this.emit(evt.name, evt.data);
    };
  }

  reconnect() {
    if (state === CONNECTION_STATES.CONNECTING) return;
    state = CONNECTION_STATES.DISCONNECTED;

    if (socket) {
      try {
        socket.close();
      } catch (e) {}
      socket = null;
    }

    setTimeout(() => this.connect(), Math.random() * (2 ** attempts - 1) * 30000);
  }

  send(name, data) {
    if (state !== CONNECTION_STATES.CONNECTED) return;

    socket.send(
      JSON.stringify({
        name,
        data,
      })
    );
  }

  joinChannel(provider, providerId) {
    const socketChannel = makeSocketChannel(provider, providerId);
    if (!joinedChannels.includes(socketChannel)) {
      joinedChannels.push(socketChannel);
    }
    this.send('join_channel', {name: socketChannel});
    this.broadcastMe(provider, providerId);
  }

  partChannel(provider, providerId) {
    const socketChannel = makeSocketChannel(provider, providerId);
    if (!joinedChannels.includes(socketChannel)) return;
    joinedChannels.splice(joinedChannels.indexOf(socketChannel), 1);
    this.send('part_channel', {name: socketChannel});
  }

  broadcastMe(provider, providerChannelId, providerUserId) {
    if (providerUserId == null) {
      const currentUser = getCurrentUser();
      if (currentUser == null) {
        return;
      }
      providerUserId = currentUser.id;
    }
    this.send('broadcast_me', {
      provider,
      providerId: providerUserId,
      channel: makeSocketChannel(provider, providerChannelId),
    });
  }
}

export default new SocketClient();
