const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const domObserver = require('../../observers/dom');

const CLAIM_BUTTON_SELECTOR = '.claimable-bonus__icon';

let channelPointsListener;

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

        this.toggleHideChannelPoints();
        this.toggleAutoClaimBonusPoints();

        settings.on('changed.hideChannelPoints', this.toggleHideChannelPoints);
        watcher.on('load.channel', this.autoClaimBonusPoints);
    }

    toggleAutoClaimBonusPoints() {
        if (settings.get('autoClaimBonusPoints')) {
            if (channelPointsListener) return;

            channelPointsListener = domObserver.on(
                CLAIM_BUTTON_SELECTOR,
                (node, isConnected) => {
                    if (!isConnected) return;
                    const $node = $(node);

                    $node.click();
                },
                {useParentNode: true}
            );

            return;
        }

        if (!channelPointsListener) return;

        channelPointsListener();
        channelPointsListener = undefined;
    }

    toggleHideChannelPoints() {
        $('body').toggleClass(
            'bttv-hide-channel-points',
            settings.get('hideChannelPoints')
        );
    }
}

module.exports = new ChannelPoints();
