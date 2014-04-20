module.exports = {
    userData: {
        isLoggedIn: window.Twitch ? Twitch.user.isLoggedIn() : false,
        login: window.Twitch ? Twitch.user.login() : ''
    },
    settings: {},
    liveChannels: [],
    blackChat: false
};