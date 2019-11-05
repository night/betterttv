const $ = require('jquery');
const watcher = require('../../watcher');

const containerSelector = '.chat-input__buttons-container';
const buttonSelector = '.claimable-bonus__icon';

class ChannelPoints {
    constructor() {
        watcher.on('load.channel', () => this.load());
    }

    load() {
        if ($(buttonSelector).length) {
            $(buttonSelector).click();
        }

        const bonusPointsObserver = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    const $el = $(el);

                    if ($el.find(buttonSelector).length) {
                        $el.click();
                    }
                }
            })
        );

        const observe = (_watcher, element) => {
            if (!element) return;
            if (_watcher) _watcher.disconnect();
            _watcher.observe(element, {childList: true, subtree: true});
        };

        observe(bonusPointsObserver, $(containerSelector)[0]);
    }
}

module.exports = new ChannelPoints();
