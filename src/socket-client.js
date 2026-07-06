import throttle from 'lodash.throttle';
import useAuthStore, {getCredentials, setCredentials} from '@/stores/auth';
import {refreshAndSetCredentials} from '@/utils/auth';
import debug from '@/utils/debug';
import {isUserPro} from '@/utils/pro';
import SafeEventEmitter from '@/utils/safe-event-emitter';
import {getCurrentUser} from '@/utils/user';
import {CLOUD_BACKUP_SETTINGS_STORAGE_KEY, SettingIds, SOCKET_ENDPOINT} from './constants';
import settings from './settings';
import storage from './storage';

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
  SETTINGS_UPDATE: 'settings_update',
  AUTHENTICATION_UPDATE: 'authentication_update',
  USER_UPDATE: 'user_update',
  SESSION_LOCK_UPDATE: 'session_lock_update',
  SESSION_LOCK_RELEASED: 'session_lock_released',
};

const WEBSOCKET_ENDPOINT = SOCKET_ENDPOINT ?? 'wss://sockets.betterttv.net/ws';

let socket;
let state = CONNECTION_STATES.DISCONNECTED;
let attempts = 1;
let authenticated = false;
let retryAuthenticationRequest = true;

const joinedChannels = [];
// session locks this client wants to hold, and the subset the server has granted us
const desiredSessionLocks = new Set();
const heldSessionLocks = new Set();
const pendingSessionLockAcquires = new Set();

// desired intent survives a reconnect; what we hold and what we're mid-acquire does not
function resetSessionLockConnectionState() {
  heldSessionLocks.clear();
  pendingSessionLockAcquires.clear();
}

function makeSocketChannel(provider, providerId) {
  return `${provider}:${providerId}`;
}

export function deserializeSocketChannel(channel) {
  return channel.split(':');
}

function handleUserUpdateEvent(newUser) {
  const {user} = useAuthStore.getState();

  if (user.id !== newUser.id) {
    return;
  }

  useAuthStore.setState({user: newUser});
}

function shouldRequestAuthentication() {
  const {user} = useAuthStore.getState();
  if (!isUserPro(user)) {
    return false;
  }

  if (settings.get(SettingIds.SELF_BOT) === true) {
    return true;
  }

  const cloudBackupSettings = storage.get(CLOUD_BACKUP_SETTINGS_STORAGE_KEY);
  return cloudBackupSettings != null && cloudBackupSettings.enabled === true;
}

class SocketClient extends SafeEventEmitter {
  constructor() {
    super();

    this.connect();

    useAuthStore.subscribe(
      (state) => state.credentials,
      () => this.handleAuthenticationRequest()
    );

    useAuthStore.subscribe(
      (state) => isUserPro(state.user),
      () => this.handleAuthenticationRequest()
    );

    settings.on(`changed.${SettingIds.SELF_BOT}`, () => this.handleAuthenticationRequest());

    import('@/modules/cloud_backup').then(({default: cloudBackup}) => {
      let cloudBackupEnabled = cloudBackup.settings.enabled === true;
      cloudBackup.on('changed', (newSettings) => {
        const enabled = newSettings.enabled === true;
        if (enabled === cloudBackupEnabled) {
          return;
        }
        cloudBackupEnabled = enabled;
        this.handleAuthenticationRequest();
      });
    });

    this.broadcastMe = throttle(this.broadcastMe.bind(this), 1000, {leading: false});
  }

  handleAuthenticationRequest() {
    if (state !== CONNECTION_STATES.CONNECTED) {
      return;
    }

    const {accessToken} = getCredentials();

    if (accessToken == null || !shouldRequestAuthentication()) {
      this.send('authentication_logout');
    } else {
      this.send('authentication_request', {token: accessToken});
    }
  }

  async handleAuthenticationUpdate(data) {
    authenticated = data.authenticated === true;

    if (authenticated) {
      retryAuthenticationRequest = true;
      // session locks live on the (possibly new) authenticated connection, so (re)claim any we want
      resetSessionLockConnectionState();
      for (const key of desiredSessionLocks) {
        this.sendAcquireSessionLock(key);
      }
      return;
    }

    // our locks are gone once we lose authentication
    resetSessionLockConnectionState();

    if (data.reason === 'invalid_token') {
      if (!retryAuthenticationRequest) {
        setCredentials(null);
        return;
      }

      retryAuthenticationRequest = false;
      await refreshAndSetCredentials();
    }
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

      this.handleAuthenticationRequest();
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

      if (evt.name === EventNames.AUTHENTICATION_UPDATE) {
        this.handleAuthenticationUpdate(evt.data);
      }

      if (evt.name === EventNames.USER_UPDATE) {
        handleUserUpdateEvent(evt.data);
      }

      if (evt.name === EventNames.SESSION_LOCK_UPDATE) {
        this.handleSessionLockUpdate(evt.data);
      }

      if (evt.name === EventNames.SESSION_LOCK_RELEASED) {
        this.handleSessionLockReleased(evt.data);
      }

      this.emit(evt.name, evt.data);
    };
  }

  // result of this session's own acquire/release request
  handleSessionLockUpdate({key, acquired} = {}) {
    if (key == null) {
      return;
    }

    pendingSessionLockAcquires.delete(key);

    if (acquired) {
      heldSessionLocks.add(key);
    } else {
      heldSessionLocks.delete(key);
    }
  }

  // a holder (on any server) freed this lock; reclaim it if we want it and don't hold it
  handleSessionLockReleased({key} = {}) {
    if (key == null || !desiredSessionLocks.has(key)) {
      return;
    }

    this.sendAcquireSessionLock(key);
  }

  // single gate for actually sending an acquire: skip if we already hold it or one is in flight
  sendAcquireSessionLock(key) {
    if (heldSessionLocks.has(key) || pendingSessionLockAcquires.has(key)) {
      return;
    }

    pendingSessionLockAcquires.add(key);
    this.send('acquire_session_lock', {key});
  }

  acquireSessionLock(key) {
    desiredSessionLocks.add(key);
    this.sendAcquireSessionLock(key);
  }

  releaseSessionLock(key) {
    // gate on desire, not held: an acquire may still be in flight (not yet granted),
    // and releasing only on `held` would leak that lock on the server if the grant lands
    // after we give up. the server ignores a release from a non-holder, so this is safe.
    const wasDesired = desiredSessionLocks.delete(key);
    heldSessionLocks.delete(key);
    pendingSessionLockAcquires.delete(key);

    if (wasDesired) {
      this.send('release_session_lock', {key});
    }
  }

  hasSessionLock(key) {
    return heldSessionLocks.has(key);
  }

  reconnect() {
    if (state === CONNECTION_STATES.CONNECTING) return;
    state = CONNECTION_STATES.DISCONNECTED;

    // locks do not survive a dropped connection; we re-acquire after re-authenticating
    resetSessionLockConnectionState();

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
