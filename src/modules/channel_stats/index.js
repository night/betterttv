const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');

let timer = null;

class ChannelStatsModule {
    constructor() {
        watcher.on('load', () => {
            if (!timer) return;
            clearTimeout(timer);
            timer = null;
        });
        watcher.on('load.channel', () => {
            if (timer) clearTimeout(timer);
            timer = setInterval(() => this.updateStats(), 60000 + Math.random() * 5000);
        });
    }

    updateStats() {
        debug.log('Updating Channel Stats');

        const channelContainer = twitch.getEmberContainer('controller:channel');
        let channelModel = channelContainer.channelModel;

        if (channelModel.hostModeTarget) {
            channelModel = channelModel.hostModeTarget;
        }

        const channelID = channelModel.get('_id');
        if (!channelID) return;

        twitchAPI
            .get(`channels/${channelID}`)
            .then(({game, followers, views, status}) => {
                channelModel.set('game', game);
                channelModel.set('views', views);
                channelModel.set('status', status);
                channelModel.set('followers.content.meta.total', followers);
            });
    }
}

module.exports = new ChannelStatsModule();
