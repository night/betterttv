const settings = require('../../settings');
const css = require('../../utils/css');

class HideBitsModule {
    constructor() {
        settings.add({
            id: 'hideBits',
            name: 'Hide Bits',
            defaultValue: false,
            description: 'Bits can be annoying. Disable \'em in chat with this (we can\'t block \'em on stream, sry)'
        });
        settings.on('changed.hideBits', value => value === true ? this.load() : this.unload());
        if (settings.get('hideBits') === true) this.load();
    }

    load() {
        css.load('hide-bits');
    }

    unload() {
        css.unload('hide-bits');
    }
}

module.exports = new HideBitsModule();
