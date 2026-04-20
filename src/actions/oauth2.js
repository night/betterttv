import {API_ENDPOINT} from '../constants.js';
import api from '../utils/api.js';

export async function getMe() {
  return api.get('oauth2/me', {version: null, withAuth: true});
}

export function getAuthorizeUrl() {
  return new URL('oauth2/authorize', API_ENDPOINT);
}

export async function exchangeCodeForCredentials({code, codeVerifier, clientId, redirectUri, signal}) {
  return api.post('oauth2/token', {
    signal,
    autoRefreshToken: false,
    version: null,
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });
}

export async function refreshAccessToken({refreshToken, clientId}) {
  return api.post('oauth2/token', {
    autoRefreshToken: false,
    version: null,
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });
}

export function revokeAccessToken({token}) {
  return api.post('oauth2/token/revoke', {
    autoRefreshToken: false,
    version: null,
    body: new URLSearchParams({token}),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  });
}
