// source https://discuss.dev.twitch.tv/t/complete-host-list/12464/2
const ENDPOINT = 'https://tmi.twitch.tv/';


function getHostedChannel(userId) {
    return fetch(`${ENDPOINT}hosts?include_logins=1&host=${userId}`)
        .then(response => {
            if (response.status >= 400) {
                throw response;
            }
            return response.json();
        })
        .then(data => data && data.hosts && data.hosts[0]);
}

function getChannelsHosting(userId) {
    return fetch(`${ENDPOINT}hosts?include_logins=1&target=${userId}`)
        .then(response => {
            if (response.status >= 400) {
                throw response;
            }
            return response.json();
        })
        .then(data => data ? data.hosts : data);
}


module.exports = {
    getHostedChannel,
    getChannelsHosting
};

