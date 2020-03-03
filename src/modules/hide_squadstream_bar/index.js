const $ = require('jquery');
const settings = require('../../settings');

class HideSquadStreamBarModule {
    constructor() {
        settings.add({
            id: 'hideSquadStreamBar',
            name: 'Hide Squadstream Bar',
            defaultValue: false,
            description: 'Hide the purple squadstreambar above the player.'
        });
        settings.on('changed.hideSquadStreamBar', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-squadstream-bar', settings.get('hideSquadStreamBar'));
    }
}

module.exports = new HideSquadStreamBarModule();
