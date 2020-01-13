const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

const containerSelector = '.chat-input__buttons-container';
const claimButtonSelector = '.claimable-bonus__icon';

const bonusPointsObserver = new window.MutationObserver(mutations =>
    mutations.forEach(mutation => {
        for (const el of mutation.addedNodes) {
            $(el).find(claimButtonSelector).click();
        }
    })
);

class ChannelPoints {
    constructor() {
        settings.add({
            id: 'autoClaimBonusPoints',
            name: 'Automatic Claim of Bonus Points',
            defaultValue: false,
            description: 'Automatically claim channel bonus points'
        });
        settings.add({
            id: 'hideChannelPoints',
            name: 'Hide Channel Points',
            defaultValue: false,
            description: 'Hides channel points from the chat UI to reduce clutter'
        });

        settings.on('changed.hideChannelPoints', () => this.hideChannelPoints());
        settings.on('changed.autoClaimBonusPoints', () => this.autoClaimBonusPoints());

        this.autoClaimBonusPoints();
        watcher.on('load.channel', () => this.autoClaimBonusPoints());
    }

    autoClaimBonusPoints() {
        if (!settings.get('autoClaimBonusPoints')) {
            bonusPointsObserver.disconnect();
            return;
        }

        $(claimButtonSelector).click();

        const observe = (_watcher, element) => {
            if (!element) return;
            if (_watcher) _watcher.disconnect();
            _watcher.observe(element, {childList: true, subtree: true});
        };

        observe(bonusPointsObserver, $(containerSelector)[0]);
    }

    hideChannelPoints() {
        $('body').toggleClass('bttv-hide-channel-points', settings.get('hideChannelPoints'));
    }
}

module.exports = new ChannelPoints();
