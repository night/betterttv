const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const domObserver = require('../../observers/dom');

let removeCommunityHighlightsListener;

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
        if (settings.get('hideCommunityHighlights')) {
            if (removeCommunityHighlightsListener) return;

            removeCommunityHighlightsListener = domObserver.on('.community-highlight-stack__card', (node, isConnected) => {
                if (!isConnected) return;
                const $node = $(node);
                if ($node.find('.channel-poll__more-icon').length > 0) return;
                if ($node.find('button[data-test-selector="community-prediction-highlight-header__action-button"]').length > 0) return;
                $node.addClass('bttv-hide-community-highlights');
            });
            return;
        }

        if (!removeCommunityHighlightsListener) return;

        removeCommunityHighlightsListener();
        removeCommunityHighlightsListener = undefined;
        $('.community-highlight-stack__card').removeClass('bttv-hide-community-highlights');
    }
}

module.exports = new HideCommunityHighlightsModule();
