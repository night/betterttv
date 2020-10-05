const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const domObserver = require('../../observers/dom');

const CLAIM_BUTTON_SELECTOR = '.claimable-bonus__icon';

let removeChannelPointsListener;

class ChannelPoints {
    constructor() {
        settings.add({
            id: 'autoClaimBonusChannelPoints',
            name: 'Auto-Claim Bonus Channel Points',
            defaultValue: false,
            description: 'Automatically claim bonus channel points',
        });
        settings.add({
            id: 'hideChannelPoints',
            name: 'Hide Channel Points',
            defaultValue: false,
            description: 'Hides channel points from the chat UI to reduce clutter',
        });

        this.loadAutoClaimBonusPoints();
        this.loadHideChannelPoints();
 
        settings.on('changed.autoClaimBonusChannelPoints', () => this.loadAutoClaimBonusPoints());
        settings.on('changed.hideChannelPoints', () => this.loadHideChannelPoints());
    }

    loadAutoClaimBonusPoints() {
        if (settings.get('autoClaimBonusPoints')) {
            if (removeChannelPointsListener) return;

            removeChannelPointsListener = domObserver.on(
                CLAIM_BUTTON_SELECTOR,
                (node, isConnected) => {
                    if (!isConnected) return;
                    const $node = $(node);

                    $node.click();
                }
            );

            return;
        }

        if (!removeChannelPointsListener) return;

        removeChannelPointsListener();
        removeChannelPointsListener = undefined;
    }

    loadHideChannelPoints() {
        $('body').toggleClass(
            'bttv-hide-channel-points',
            settings.get('hideChannelPoints')
        );
    }
}

module.exports = new ChannelPoints();
