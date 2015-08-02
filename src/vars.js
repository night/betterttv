module.exports = {
    userData: {
        isLoggedIn: window.Twitch && Twitch.user ? Twitch.user.isLoggedIn() : false,
        login: window.Twitch && Twitch.user ? Twitch.user.login() : ''
    },
    settings: {},
    liveChannels: [],
    blackChat: false
};
