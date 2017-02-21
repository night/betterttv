const $ = require('jquery');
const watcher = require('../../watcher');

function toggleSubCreditIcon($subButton, hasSubCredit) {
    $subButton.find('.button').toggleClass('bttv-prime-sub-reminder', hasSubCredit);
}

class PrimeSubReminderModule {
    constructor() {
        watcher.on('load.channel', () => this.load());
    }

    load() {
        const $subButton = $('.js-subscribe-button-dynamic').parent();
        if ($subButton.length === 0) return;

        const subButton = App.__container__.lookup('-view-registry:main')[$subButton.attr('id')];
        if (!subButton) return;

        toggleSubCreditIcon($subButton, subButton.hasSubCredit);
        subButton.addObserver('hasSubCredit', () => toggleSubCreditIcon($subButton, subButton.hasSubCredit));
    }
}

module.exports = new PrimeSubReminderModule();
