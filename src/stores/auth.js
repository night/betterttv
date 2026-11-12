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
// what the stored user (or mismatch) was last checked against. only set once a check succeeds, so a
// failed one runs again on the next credentials or platform user update
let syncedCredentials = null;
let syncedPlatformUserId = null;
// the platform user a check is in flight for, so repeated user.updated events don't stack checks
let syncingPlatformUserId = null;

function setUserState(user, accountMismatch) {
  const state = useAuthStore.getState();
  if (state.user === user && state.accountMismatch === accountMismatch) {
    return;
  }

  useAuthStore.setState({user, accountMismatch});
}

async function syncUser(credentials) {
  // youtube only knows who is signed in once its chat input renders, and nobody is when signed out
  // of the platform. this runs again once the platform user loads
  const platformUser = getCurrentUser();

  if (credentials.accessToken == null || platformUser == null) {
    syncedCredentials = null;
    syncedPlatformUserId = null;
    setUserState(null, false);
    return;
  }

  if (syncedCredentials === credentials && syncedPlatformUserId === platformUser.id) {
    return;
  }

  // the stored user belongs to another platform user, so don't keep showing it while checking
  if (syncedPlatformUserId != null && syncedPlatformUserId !== platformUser.id) {
    syncedCredentials = null;
    syncedPlatformUserId = null;
    setUserState(null, false);
  }

  const provider = getProvider();
  syncingPlatformUserId = platformUser.id;

  let connections;
  let me;
  try {
    const {getConnections, getMe} = await getActions();
    [connections, {user: me}] = await Promise.all([getConnections(), getMe()]);
  } finally {
    if (syncingPlatformUserId === platformUser.id) {
      syncingPlatformUserId = null;
    }
  }

  // a newer sign in, sign out or platform user took over while this was in flight
  if (getCredentials() !== credentials || getCurrentUser()?.id !== platformUser.id) {
    return;
  }

  const hasConnectedAccount = connections.some(
    (account) => account.provider === provider && account.providerId === platformUser.id
  );

  syncedCredentials = credentials;
  syncedPlatformUserId = platformUser.id;
  setUserState(hasConnectedAccount ? me : null, !hasConnectedAccount);
}

export function syncCurrentUserFromCredentials(credentialsParam = null) {
  userSync = syncUser(credentialsParam ?? getCredentials());
  return userSync;
}

// settles once the latest credentials have resolved to a user, or a mismatched one
export async function waitForUserSync() {
  // a sync started while waiting (e.g. the platform user loading) supersedes the one being waited on,
  // so only the latest one's failure counts
  let sync;
  let result;
  do {
    sync = userSync;
    [result] = await Promise.allSettled([sync]);
  } while (sync !== userSync);

  if (result.status === 'rejected') {
    throw result.reason;
  }
}

function syncInBackground(credentials) {
  syncCurrentUserFromCredentials(credentials).catch((error) => debug.log('failed to sync BetterTTV user', error));
}

useAuthStore.subscribe((state) => state.credentials, syncInBackground);
syncInBackground();

watcher.on('user.updated', (platformUser) => {
  if (getCredentials().accessToken == null) {
    return;
  }

  if (platformUser?.id === syncedPlatformUserId || platformUser?.id === syncingPlatformUserId) {
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
