const $ = require('jquery');

const API_ENDPOINT = 'https://gql.twitch.tv/gql';
const CLIENT_ID = '6x8avioex0zt85ht6py4sq55z6avsea';

let accessToken;

function request(method, fields) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: API_ENDPOINT,
            method,
            dataType: 'json',
            contentType: 'application/json',
            data: fields ? JSON.stringify(fields) : undefined,
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': accessToken ? `OAuth ${accessToken}` : undefined
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
    setAccessToken(newAccessToken) {
        accessToken = newAccessToken;
    },
    query(fields, options) {
        return request('POST', fields, options);
    }
};
