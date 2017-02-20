const $ = require('jquery');
const debug = require('../../utils/debug');
const watcher = require('../../watcher');

class GlobalCSSModule {
    constructor() {
        this.globalCSS();
        this.branding();
        watcher.on('load', () => this.branding());
    }

    globalCSS() {
        const globalCSSInject = document.createElement('link');
        globalCSSInject.setAttribute('href', `https://cdn.betterttv.net/css/betterttv.css?${debug.version}`);
        globalCSSInject.setAttribute('type', 'text/css');
        globalCSSInject.setAttribute('rel', 'stylesheet');
        $('body').append(globalCSSInject);
    }

    branding() {
        if ($('#bttv_logo').length) return;

        const $watermark = $('<img />');
        $watermark.attr('id', 'bttv_logo');
        $watermark.attr('src', 'https://cdn.betterttv.net/assets/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '-10px',
            'position': 'absolute'
        });
        $('.warp .warp__logo').append($watermark);
    }
}

module.exports = new GlobalCSSModule();
