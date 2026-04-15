// eslint-disable-next-line import/no-unresolved
import pkceChallenge from 'pkce-challenge';
import {
  exchangeCodeForCredentials as exchangeCodeForCredentialsAction,
  getAuthorizeUrl,
  refreshAccessToken as refreshAccessTokenAction,
  revokeAccessToken as revokeAccessTokenAction,
} from '../actions/oauth2.js';
import {OAUTH2_CLIENT_ID, OAUTH2_REDIRECT_URI} from '../constants.js';
import formatMessage from '../i18n/index.js';
import Popup from './popup.js';

const REQUIRED_SCOPES = ['sso'];
const POPUP_TIMEOUT = 5 * 60 * 1000;

let popup = null;

function closePopup() {
  if (popup == null) {
    return;
  }

  popup.close();
  popup = null;
}

export async function executeOAuth2AuthorizationFlow({signal} = {}) {
  const {code_verifier: codeVerifier, code_challenge: codeChallenge} = await pkceChallenge();
  const authorizationUrl = getAuthorizeUrl();
  const state = crypto.randomUUID();

  const redirectUri = new URL(OAUTH2_REDIRECT_URI);
  const origin = window.location.origin;
  redirectUri.searchParams.set('origin', origin);
  const expectedOrigin = redirectUri.origin;

  authorizationUrl.searchParams.set('client_id', OAUTH2_CLIENT_ID);
  authorizationUrl.searchParams.set('redirect_uri', redirectUri.toString());
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', REQUIRED_SCOPES.join(' '));
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('code_challenge', codeChallenge);
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');

  if (popup != null) {
    closePopup();
  }

  popup = new Popup({
    expectedOrigin,
    windowName: formatMessage({defaultMessage: 'Login to BetterTTV'}),
  });

  let cleanUpAbortListener = null;
  if (signal != null) {
    cleanUpAbortListener = signal.addEventListener('abort', () => closePopup());
  }

  return await new Promise((resolve, reject) => {
    let isHandlingMessage = false;

    function handleMessage(data) {
      if (data?.code == null || data?.state == null) {
        return;
      }

      if (data?.state !== state) {
        return reject(new Error('State mismatch'));
      }

      if (typeof data?.error === 'string') {
        return reject(new Error(data.error_description ?? data.error));
      }

      isHandlingMessage = true;
      closePopup();

      resolve({codeVerifier, code: data.code, redirectUri});
    }

    popup.addListener('EXTENSION_CALLBACK', handleMessage);
    const timeout = setTimeout(() => closePopup(), POPUP_TIMEOUT);

    popup.once('close', () => {
      cleanUpAbortListener?.();
      cleanUpAbortListener = null;

      if (timeout != null) {
        clearTimeout(timeout);
      }

      popup.removeListener('EXTENSION_CALLBACK', handleMessage);

      if (isHandlingMessage) {
        return;
      }

      reject(new Error('Popup closed without message'));
    });

    popup.open({url: authorizationUrl, width: 400, height: 600});
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
