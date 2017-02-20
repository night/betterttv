const $ = require('jquery');
const settings = require('../../settings');

class DisableFrontpageAutoplayModule {
    constructor() {
        settings.add({
            id: 'disableFPVideo',
            name: 'Disable Frontpage Autoplay',
            defaultValue: false,
            description: 'Disable autoplay on the frontpage video player'
        });
        this.load();
    }

    load() {
        if (settings.get('disableFPVideo') === false || window.location.pathname !== '/') return;

        const $player = $('#player');
        let frameSrc = $player.children('iframe').eq(0).attr('src');
        $player.children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
        $player.bind('DOMNodeInserted DOMNodeRemoved', function() {
            frameSrc = $player.children('iframe').eq(0).attr('src');
            $player.children('iframe').eq(0).attr('src', frameSrc + '&autoplay=false');
        });
    }
}

module.exports = new DisableFrontpageAutoplayModule();
