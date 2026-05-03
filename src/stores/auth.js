import {create} from 'zustand';
import {persist, subscribeWithSelector} from 'zustand/middleware';
import {getCurrentUser} from '../utils/user.js';
import {getProvider} from '../utils/window.js';

const STORAGE_ID = 'bttvPrivate_credentials';

function credentialsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const useAuthStore = create(
  persist(
    subscribeWithSelector((set, get) => ({
      user: null,
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
    const {getMe: getMeAction} = await import('../actions/oauth2.js');
    getMe = getMeAction;
  }

  if (getConnections == null) {
    const {getConnections: getConnectionsAction} = await import('../actions/connections.js');
    getConnections = getConnectionsAction;
  }

  return {getConnections, getMe};
}

export async function syncCurrentUserFromCredentials(credentialsParam = null) {
  const resolved = credentialsParam ?? getCredentials();

  if (resolved.accessToken == null) {
    useAuthStore.setState({user: null});
    return;
  }

  const {user} = useAuthStore.getState();

  if (user != null) {
    return;
  }

  const platformUser = getCurrentUser();
  const provider = getProvider();

  const {getConnections, getMe} = await getActions();
  const [connections, {user: me}] = await Promise.all([getConnections(), getMe()]);

  const hasConnectedAccount = connections.some(
    (account) => account.provider === provider && account.providerId === platformUser.id
  );

  if (!hasConnectedAccount) {
    return;
  }

  useAuthStore.setState({user: me});
}

useAuthStore.subscribe((state) => state.credentials, syncCurrentUserFromCredentials);
syncCurrentUserFromCredentials();

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
