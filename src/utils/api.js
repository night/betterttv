const $ = require('jquery');
const querystring = require('querystring');

const API_ENDPOINT = 'https://api.betterttv.net/2/';

function request(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${API_ENDPOINT}${path}${options.qs ? `?${querystring.stringify(options.qs)}` : ''}`,
            method,
            dataType: options.dataType || 'json',
            data: options.body ? JSON.stringify(options.body) : undefined,
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
