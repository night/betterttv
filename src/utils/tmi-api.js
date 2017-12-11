const $ = require('jquery');
const querystring = require('querystring');

const TMI_ENDPOINT = 'https://tmi.twitch.tv/';

function request(method, path, options = {}) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${TMI_ENDPOINT}${path}${options.qs ? `?${querystring.stringify(options.qs)}` : ''}`,
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
    }
};
