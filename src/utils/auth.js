import {getCredentials, setCredentials} from '../stores/auth.js';
import {exchangeCodeForCredentials, executeOAuth2AuthorizationFlow, refreshAccessToken} from './oauth.js';

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
    const {refreshToken} = getCredentials();

    if (refreshToken == null) {
      throw new Error('No refresh token available');
    }

    const newCredentials = await refreshAccessToken(refreshToken);

    setCredentials({
      accessToken: newCredentials.access_token,
      refreshToken: newCredentials.refresh_token,
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

export async function executeOAuth2SignInAndSetCredentials({signal} = {}) {
  const {codeVerifier, code, redirectUri} = await executeOAuth2AuthorizationFlow({signal});
  const {access_token, refresh_token} = await exchangeCodeForCredentials({codeVerifier, code, redirectUri, signal});
  setCredentials({accessToken: access_token, refreshToken: refresh_token});
}
