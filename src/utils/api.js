import HTTPError from './http-error.js';

const API_ENDPOINT = 'https://api.betterttv.net/3/';

function request(method, path, options = {}) {
  const {searchParams} = options;
  delete options.searchParams;

  return fetch(`${API_ENDPOINT}${path}${searchParams ? `?${new URLSearchParams(searchParams).toString()}` : ''}`, {
    method,
    ...options,
  }).then(async (response) => {
    if (response.ok) {
      return response.json();
    }

    let responseJSON;
    try {
      responseJSON = await response.json();
    } catch (err) {
      throw new HTTPError(response.status, null);
    }

    throw new HTTPError(response.status, responseJSON);
  });
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
