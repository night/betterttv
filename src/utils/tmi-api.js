
const ENDPOINT = 'https://tmi.twitch.tv/';

function get(path, options) {
    return fetch(`${ENDPOINT}${path}`, options);
}

function toJson(response) {
    if (response.status >= 400) {
        throw response;
    }
    return response.json();
}

function getHostedChannel(userId) {
    return get(`/hosts?include_logins=1&host=${userId}`)
        .then(toJson)
        .then(data => data && data.hosts && data.hosts[0]);
}

function getChannelsHosting(userId) {
    return get(`/hosts?include_logins=1&target=${userId}`)
        .then(toJson)
        .then(data => data ? data.hosts : data);
}

function getChatterCount(channelName) {
    return get(`/group/user/${channelName}`)
        .then(toJson)
        .then(data => data.chatter_count);
}

function getChatters(channelName) {
    return get(`/group/user/${channelName}/chatters`)
        .then(toJson);
}

module.exports = {
    get,
    getHostedChannel,
    getChannelsHosting,
    getChatterCount,
    getChatters
};

