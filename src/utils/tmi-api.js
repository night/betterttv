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

function get(path, options) {
    return request('GET', path, options);
}

function getHostedChannel(userId) {
    return get('/hosts', { qs: { include_logins: 1, host: userId }})
        .then(data => data.hosts[0]);
}

module.exports = {
    get,
    getHostedChannel
};

