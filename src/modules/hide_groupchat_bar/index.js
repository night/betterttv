const $ = require('jquery');
const settings = require('../../settings');

class HideGroupchatBarModule {
    constructor() {
        settings.add({
            id: 'hideGroupchatBar',
            name: 'Hide Group Chat Bar',
            defaultValue: false,
            description: 'Hides bar at the top of stream chat'
        });
        settings.on('changed.hideGroupchatBar', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-groupchat-bar', settings.get('hideGroupchatBar'));
    }
}

module.exports = new HideGroupchatBarModule();
