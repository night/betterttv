const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HidePrimePromotionsModule {
    constructor() {
        settings.add({
            id: 'hidePrimePromotions',
            name: 'Hide Prime Promotions',
            defaultValue: false,
            description: 'Hides Prime Promotions such as : "Prime Loot" and "Homepage Prime Banner"'
        });

        settings.on('changed.hidePrimePromotions', this.togglePrimePromotions);
        watcher.on('load', this.togglePrimePromotions);
    }

    togglePrimePromotions() {
        $('body').toggleClass(
            'bttv-hide-prime-promotions',
            settings.get('hidePrimePromotions')
        );
    }
}

module.exports = new HidePrimePromotionsModule();
