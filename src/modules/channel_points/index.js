const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

const containerSelector = '.chat-input__buttons-container';
const claimButtonSelector = '.claimable-bonus__icon';

const bonusPointsObserver = new window.MutationObserver(mutations =>
    mutations.forEach(mutation => {
        for (const el of mutation.addedNodes) {
            const $el = $(el);

            $el.find(claimButtonSelector).click();
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
        settings.on('changed.autoClaimBonusPoints', () => this.load());
        watcher.on('load.channel', () => this.load());
    }

    load() {
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
}

module.exports = new ChannelPoints();
