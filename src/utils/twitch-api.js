const $ = require('jquery');
const twitch = require('./twitch');
const querystring = require('querystring');

const API_ENDPOINT = 'https://api.twitch.tv/v5/';
const CLIENT_ID = '6x8avioex0zt85ht6py4sq55z6avsea';

function request(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        const currentUser = twitch.getCurrentUser();
        const fullPath = `${path}${options.qs ? `?${querystring.stringify(options.qs)}` : ''}`;

        $.ajax({
            url: `${API_ENDPOINT}${fullPath}`,
            method,
            dataType: 'json',
            data: options.body ? JSON.stringify(options.body) : undefined,
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': (options.auth && currentUser) ? `OAuth ${currentUser.accessToken}` : undefined
            },
            timeout: 30000,
            success: data => resolve(data),
            error: ({status, responseJSON}) => reject({
                status,
                data: responseJSON
            })
        });
    });
}

module.exports = {
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
    }
};
