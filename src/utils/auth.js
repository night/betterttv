import {getCredentials, setCredentials} from '@/stores/auth';
import HTTPError from './http-error';
import {
  exchangeCodeForCredentials,
  executeOAuth2AuthorizationFlow,
  pollDeviceCodeForCredentials,
  refreshAccessToken,
} from './oauth';

let inFlightRefresh = null;

export async function refreshAndSetCredentials() {
  if (inFlightRefresh != null) {
    const [result] = await Promise.allSettled([inFlightRefresh]);

    if (result.status === 'fulfilled') {
      return result.value;
    }

    throw result.reason;
  }

  inFlightRefresh = (async () => {
    const {refreshToken, signInId} = getCredentials();

    if (refreshToken == null) {
      throw new Error('No refresh token available');
    }

    const newCredentials = await refreshAccessToken(refreshToken);

    // the same sign in, so it keeps its id (stores/auth.js doesn't check the account again)
    setCredentials({
      accessToken: newCredentials.access_token,
      refreshToken: newCredentials.refresh_token,
      signInId,
    });

    return newCredentials;
  })();

  inFlightRefresh = inFlightRefresh.catch((error) => {
    if (!(error instanceof HTTPError)) {
      throw error;
    }

    if (error.status === 400 || error.status === 401) {
      setCredentials(null);
    }

    throw error;
  });

  return inFlightRefresh.finally(() => (inFlightRefresh = null));
}

// a new id per sign in, so every tab checks the account again, even one that never saw the sign out before it
function signInCredentials(accessToken, refreshToken) {
  return {accessToken, refreshToken, signInId: crypto.randomUUID()};
}

export async function executeOAuth2SignInAndSetCredentials({signal} = {}) {
  const {codeVerifier, code, redirectUri} = await executeOAuth2AuthorizationFlow({signal});
  const {access_token, refresh_token} = await exchangeCodeForCredentials({codeVerifier, code, redirectUri, signal});
  setCredentials(signInCredentials(access_token, refresh_token));
}

export async function pollDeviceCodeAndSetCredentials({deviceCode, interval, signal} = {}) {
  const {access_token, refresh_token} = await pollDeviceCodeForCredentials({deviceCode, interval, signal});
  setCredentials(signInCredentials(access_token, refresh_token));
}
