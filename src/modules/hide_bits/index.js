const settings = require('../../settings');
const $ = require('jquery');

class HideBitsModule {
    constructor() {
        settings.add({
            id: 'hideBits',
            name: 'Hide Bits',
            defaultValue: false,
            description: 'Bits can be annoying. Disable \'em in chat with this (we can\'t block \'em on stream, sry)'
        });
        settings.on('changed.hideBits', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-bits', settings.get('hideBits'));
    }
}

module.exports = new HideBitsModule();
