const $ = require('jquery');
const cdn = require('../../utils/cdn');
const watcher = require('../../watcher');

class GlobalCSSModule {
    constructor() {
        this.globalCSS();
        watcher.on('load', () => this.branding());
        this.branding();
    }

    globalCSS() {
        const css = document.createElement('link');
        css.setAttribute('href', cdn.url('betterttv.css', true));
        css.setAttribute('type', 'text/css');
        css.setAttribute('rel', 'stylesheet');
        $('body').append(css);
    }

    branding() {
        if ($('.bttv-logo').length) return;

        const $watermark = $('<img />');
        $watermark.attr('class', 'bttv-logo');
        $watermark.attr('src', cdn.url('assets/logos/logo_icon.png'));
        $watermark.css({
            'z-index': 9000,
            'left': '-74px',
            'top': '-18px',
            'width': '12px',
            'height': 'auto',
            'position': 'relative'
        });
        $('.top-nav__home-link').append($watermark);
    }
}

module.exports = new GlobalCSSModule();
