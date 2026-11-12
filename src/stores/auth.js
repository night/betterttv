import {create} from 'zustand';
import {persist, subscribeWithSelector} from 'zustand/middleware';
import debug from '@/utils/debug';
import {getCurrentUser} from '@/utils/user';
import {getProvider} from '@/utils/window';
import watcher from '@/watcher';

const STORAGE_ID = 'bttvPrivate_credentials';

function credentialsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const useAuthStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      user: null,
      // signed in to a BetterTTV account that isn't connected to the platform user on the page
      accountMismatch: false,
      credentials: {accessToken: null, refreshToken: null},
      setCredentials(credentials) {
        if (credentials == null) {
          credentials = {accessToken: null, refreshToken: null};
        }

        if (credentialsEqual(credentials, get().credentials)) {
          return;
        }

        set({credentials});
      },
      updateUser(user) {
        set({user});
      },
    })),
    {
      name: STORAGE_ID,
      partialize: (state) => ({credentials: state.credentials}),
    }
  )
);

export function getCredentials() {
  return useAuthStore.getState().credentials;
}

let getConnections = null;
let getMe = null;

export async function getActions() {
  if (getMe == null) {
    const {getMe: getMeAction} = await import('@/actions/oauth2');
    getMe = getMeAction;
  }

  if (getConnections == null) {
    const {getConnections: getConnectionsAction} = await import('@/actions/connections');
    getConnections = getConnectionsAction;
  }

  return {getConnections, getMe};
}

let userSync = Promise.resolve();
// the platform user the latest sync checked the BetterTTV account against
let syncedPlatformUserId = null;

async function syncUser(credentials) {
  if (credentials.accessToken == null) {
    syncedPlatformUserId = null;
    useAuthStore.setState({user: null, accountMismatch: false});
    return;
  }

  // youtube only knows who is signed in once its chat input renders, and nobody is when signed out
  // of the platform. this runs again once the platform user loads
  const platformUser = getCurrentUser();
  if (platformUser == null) {
    syncedPlatformUserId = null;
    useAuthStore.setState({user: null, accountMismatch: false});
    return;
  }

  const {user} = useAuthStore.getState();

  if (user != null && syncedPlatformUserId === platformUser.id) {
    return;
  }

  syncedPlatformUserId = platformUser.id;
  const provider = getProvider();

  const {getConnections, getMe} = await getActions();
  const [connections, {user: me}] = await Promise.all([getConnections(), getMe()]);

  // a newer sign in, sign out or platform user took over while this was in flight
  if (getCredentials() !== credentials || getCurrentUser()?.id !== platformUser.id) {
    return;
  }

  const hasConnectedAccount = connections.some(
    (account) => account.provider === provider && account.providerId === platformUser.id
  );

  if (!hasConnectedAccount) {
    useAuthStore.setState({user: null, accountMismatch: true});
    return;
  }

  useAuthStore.setState({user: me, accountMismatch: false});
}

export function syncCurrentUserFromCredentials(credentialsParam = null) {
  userSync = syncUser(credentialsParam ?? getCredentials());
  return userSync;
}

// settles once the latest credentials have resolved to a user, or a mismatched one
export async function waitForUserSync() {
  // a sync started while waiting (e.g. the platform user loading) supersedes the one being waited on
  let sync;
  do {
    sync = userSync;
    await sync;
  } while (sync !== userSync);
}

function syncInBackground(credentials) {
  syncCurrentUserFromCredentials(credentials).catch((error) => debug.log('failed to sync BetterTTV user', error));
}

useAuthStore.subscribe((state) => state.credentials, syncInBackground);
syncInBackground();

watcher.on('user.updated', (platformUser) => {
  if (platformUser?.id === syncedPlatformUserId) {
    return;
  }

  syncInBackground();
});

window.addEventListener('storage', (event) => {
  if (event.storageArea !== window.localStorage) {
    return;
  }

  if (event.key !== STORAGE_ID) {
    return;
  }

  useAuthStore.persist.rehydrate();
});

export function setCredentials(credentials) {
  const {setCredentials: applyCredentials} = useAuthStore.getState();
  applyCredentials(credentials);
}

export default useAuthStore;
