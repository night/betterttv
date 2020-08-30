const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HideCommunityHighlightsModule {
    constructor() {
        settings.add({
            id: 'hideCommunityHighlights',
            name: 'Hide Community Highlights',
            defaultValue: false,
            description: 'Hides the alerts above chat for hype trains, community chest, etc.'
        });

        settings.on('changed.hideCommunityHighlights', this.toggleCommunityHighlights);
        watcher.on('load', this.toggleCommunityHighlights);
    }

    toggleCommunityHighlights() {
        $('body').toggleClass(
            'bttv-hide-community-highlights',
            settings.get('hideCommunityHighlights')
        );
    }
}

module.exports = new HideCommunityHighlightsModule();
