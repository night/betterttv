const $ = require('jquery');
const settings = require('../../settings');

class HideChannelLeaderboardModule {
    constructor() {
        settings.add({
            id: 'hideChannelLeaderboard',
            name: 'Hide Channel Leaderboard',
            defaultValue: false,
            description: 'Hides channel leaderboard from the top of chat to reduce clutter'
        });
        settings.on('changed.hideChannelLeaderboard', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-channel-leaderboard', settings.get('hideChannelLeaderboard'));
    }
}

module.exports = new HideChannelLeaderboardModule();
