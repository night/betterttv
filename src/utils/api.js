import {API_ENDPOINT as API_ENDPOINT_CONSTANT, API_VERSION as API_VERSION_CONSTANT} from '../constants.js';
import {getCredentials} from '../stores/auth.js';
import {refreshAndSetCredentials} from './auth.js';
import HTTPError from './http-error.js';

const API_ENDPOINT = API_ENDPOINT_CONSTANT ?? 'https://api.betterttv.net/';
const API_VERSION = API_VERSION_CONSTANT ?? '3';

async function request(method, path, options = {}) {
  const {searchParams, version = API_VERSION, autoRefreshToken = true, headers = {}, ...restOptions} = options;

  let url = null;
  if (version != null) {
    url = new URL(`${API_VERSION}/${path}`, API_ENDPOINT);
  } else {
    url = new URL(path, API_ENDPOINT);
  }

  if (searchParams !== undefined) {
    url.search = new URLSearchParams(searchParams).toString();
  }

  if (restOptions.body !== undefined && headers['Content-Type'] === undefined) {
    headers['Content-Type'] = 'application/json';
    restOptions.body = JSON.stringify(restOptions.body);
  }

  const includeAuth = path.startsWith('cached/');
  const {accessToken, refreshToken} = getCredentials();
  if (includeAuth && accessToken != null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {method, headers, ...restOptions});
    let responseJSON = null;

    try {
      responseJSON = await response.json();
    } catch (_) {}

    if (response.ok) {
      return responseJSON;
    }

    throw new HTTPError(response.status, responseJSON);
  } catch (error) {
    if (!(error instanceof HTTPError)) {
      throw error;
    }

    if (autoRefreshToken && includeAuth && refreshToken != null && error.status === 401) {
      await refreshAndSetCredentials();
      return request(method, path, {...options, autoRefreshToken: false});
    }

    throw error;
  }
}

export default {
  get(path, options) {
    return request('GET', path, options);
  },

  post(path, options) {
    return request('POST', path, options);
  },

  put(path, options) {
    return request('PUT', path, options);
  },

  patch(path, options) {
    return request('PATCH', path, options);
  },

  delete(path, options) {
    return request('DELETE', path, options);
  },
};
