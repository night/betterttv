const $ = require('jquery');
const cdn = require('../../utils/cdn');
const css = require('../../utils/css');
const watcher = require('../../watcher');

class GlobalCSSModule {
    constructor() {
        this.globalCSS();
        this.branding();
        watcher.on('load', () => this.branding());
    }

    globalCSS() {
        css.load();
    }

    branding() {
        if ($('#bttv_logo').length) return;

        const $watermark = $('<img />');
        $watermark.attr('id', 'bttv_logo');
        $watermark.attr('src', cdn.url('assets/logos/logo_icon.png'));
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
