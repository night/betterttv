import pkceChallenge from 'pkce-challenge';
import {
  exchangeCodeForCredentials as exchangeCodeForCredentialsAction,
  exchangeDeviceCodeForCredentials,
  getAuthorizeUrl,
  refreshAccessToken as refreshAccessTokenAction,
  requestDeviceCode as requestDeviceCodeAction,
  revokeAccessToken as revokeAccessTokenAction,
} from '@/actions/oauth2';
import {OAUTH2_CLIENT_ID, OAUTH2_REDIRECT_URI} from '@/constants';
import formatMessage from '@/i18n/index';
import HTTPError from './http-error';
import Popup from './popup';

const REQUIRED_SCOPES = ['sso'];
const POPUP_TIMEOUT = 5 * 60 * 1000;
// https://datatracker.ietf.org/doc/html/rfc8628#section-3.5
const SLOW_DOWN_INTERVAL_INCREMENT = 5;

let popup = null;

export class PopupBlockedError extends Error {}

function closePopup() {
  if (popup == null) {
    return;
  }

  popup.close();
  popup = null;
}

export async function executeOAuth2AuthorizationFlow({signal} = {}) {
  const state = crypto.randomUUID();

  const redirectUri = new URL(OAUTH2_REDIRECT_URI);
  const origin = window.location.origin;
  redirectUri.searchParams.set('origin', origin);
  const expectedOrigin = redirectUri.origin;

  if (popup != null) {
    closePopup();
  }

  const currentPopup = new Popup({
    expectedOrigin,
    windowName: formatMessage({defaultMessage: 'Login to BetterTTV'}),
  });

  // open before any await, browsers like Safari and Firefox block popups that aren't opened
  // directly from the click
  if (!currentPopup.open({url: 'about:blank', width: 400, height: 600})) {
    throw new PopupBlockedError('Popup blocked');
  }

  popup = currentPopup;

  let cleanUpAbortListener = null;
  if (signal != null) {
    const onAbort = () => closePopup();
    signal.addEventListener('abort', onAbort);
    cleanUpAbortListener = () => signal.removeEventListener('abort', onAbort);
  }

  return await new Promise((resolve, reject) => {
    let isHandlingMessage = false;
    let isClosed = false;
    let codeVerifier = null;

    function handleMessage(data) {
      if (data?.state == null) {
        return;
      }

      if (data?.state !== state) {
        isHandlingMessage = true;
        closePopup();
        return reject(new Error('State mismatch'));
      }

      if (typeof data?.error === 'string') {
        isHandlingMessage = true;
        closePopup();
        return reject(new Error(data.error_description ?? data.error));
      }

      if (data?.code == null) {
        return;
      }

      isHandlingMessage = true;
      closePopup();

      resolve({codeVerifier, code: data.code, redirectUri});
    }

    currentPopup.addListener('EXTENSION_CALLBACK', handleMessage);
    const timeout = setTimeout(() => closePopup(), POPUP_TIMEOUT);

    currentPopup.once('close', () => {
      isClosed = true;
      cleanUpAbortListener?.();
      cleanUpAbortListener = null;

      if (timeout != null) {
        clearTimeout(timeout);
      }

      currentPopup.removeListener('EXTENSION_CALLBACK', handleMessage);

      if (isHandlingMessage) {
        return;
      }

      reject(new Error('Popup closed without message'));
    });

    pkceChallenge()
      .then(({code_verifier: newCodeVerifier, code_challenge: codeChallenge}) => {
        if (isClosed) {
          return;
        }

        codeVerifier = newCodeVerifier;

        const authorizationUrl = getAuthorizeUrl();
        authorizationUrl.searchParams.set('client_id', OAUTH2_CLIENT_ID);
        authorizationUrl.searchParams.set('redirect_uri', redirectUri.toString());
        authorizationUrl.searchParams.set('response_type', 'code');
        authorizationUrl.searchParams.set('scope', REQUIRED_SCOPES.join(' '));
        authorizationUrl.searchParams.set('state', state);
        authorizationUrl.searchParams.set('code_challenge', codeChallenge);
        authorizationUrl.searchParams.set('code_challenge_method', 'S256');

        currentPopup.setLocation(authorizationUrl.toString());
      })
      .catch((error) => {
        isHandlingMessage = true;
        closePopup();
        reject(error);
      });
  });
}

export async function exchangeCodeForCredentials({code, codeVerifier, redirectUri, signal} = {}) {
  if (codeVerifier == null) {
    throw new Error('Code verifier not found');
  }

  if (code == null) {
    throw new Error('Code not found');
  }

  return exchangeCodeForCredentialsAction({
    signal,
    code,
    codeVerifier,
    clientId: OAUTH2_CLIENT_ID,
    redirectUri: redirectUri.toString(),
  });
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    function onAbort() {
      clearTimeout(timeout);
      reject(signal.reason);
    }

    const timeout = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort, {once: true});
  });
}

export async function requestDeviceCode({signal} = {}) {
  return requestDeviceCodeAction({signal, clientId: OAUTH2_CLIENT_ID, scope: REQUIRED_SCOPES.join(' ')});
}

export async function pollDeviceCodeForCredentials({deviceCode, interval, signal} = {}) {
  if (deviceCode == null) {
    throw new Error('Device code not found');
  }

  for (;;) {
    await wait(interval * 1000, signal);

    try {
      return await exchangeDeviceCodeForCredentials({signal, deviceCode, clientId: OAUTH2_CLIENT_ID});
    } catch (error) {
      const errorCode = error instanceof HTTPError ? error.data?.error : null;

      if (errorCode === 'slow_down') {
        interval += SLOW_DOWN_INTERVAL_INCREMENT;
        continue;
      }

      if (errorCode !== 'authorization_pending') {
        throw error;
      }
    }
  }
}

export async function refreshAccessToken(refreshToken) {
  if (refreshToken == null) {
    throw new Error('Refresh token not found');
  }

  return refreshAccessTokenAction({refreshToken, clientId: OAUTH2_CLIENT_ID});
}

export async function revokeAccessToken(token) {
  if (token == null) {
    throw new Error('Access token not found');
  }

  return revokeAccessTokenAction({token});
}
