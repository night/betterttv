const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class DisableVodAutoplay {
    constructor() {
        settings.add({
            id: 'disableVodAutoplay',
            name: 'Disable Vod Autoplay',
            defaultValue: false,
            description: 'Disables autoplay for Vods'
        });
        watcher.on('vod.recommendation', () => {
            if (settings.get('disableVodAutoplay') === true) {
                $('.recommendations-overlay .pl-rec__cancel.pl-button').trigger('click');
            }
        });
    }
}

module.exports = new DisableVodAutoplay();
