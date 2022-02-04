import $ from 'jquery';
import HTTPError from './http-error.js';

const GQL_ENDPOINT = 'https://gql.twitch.tv/gql';
const CLIENT_ID = '6x8avioex0zt85ht6py4sq55z6avsea';

let accessToken;

function request(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: GQL_ENDPOINT,
      method,
      dataType: 'json',
      data: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        'Client-ID': CLIENT_ID,
        Authorization: options.auth && accessToken ? `OAuth ${accessToken}` : undefined,
      },
      timeout: 30000,
      success: (data) => resolve(data),
      error: ({status, responseJSON}) => reject(new HTTPError(status, responseJSON)),
    });
  });
}

export default {
  setAccessToken(newAccessToken) {
    accessToken = newAccessToken;
  },

  graphqlQuery(query, variables) {
    if (accessToken == null) {
      return Promise.reject(new Error('unset accessToken'));
    }

    let body;
    if (Array.isArray(query)) {
      body = query;
      if (variables) {
        throw new Error('variables cannot be specified with array of queries');
      }
    } else {
      body = {query};
      if (variables) {
        body.variables = variables;
      }
    }

    return request('POST', null, {
      body,
      auth: true,
    });
  },
};
