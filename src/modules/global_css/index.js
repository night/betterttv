const $ = require('jquery');
const debug = require('../../utils/debug');
const watcher = require('../../watcher');
const settings = require('../../settings');

class GlobalCSSModule {
    constructor() {
        this.globalCSS();
        this.branding();
        watcher.on('load', () => this.branding());

        this.loadDark();
        settings.add({
            id: 'darkenedMode',
            name: 'Dark Theme',
            defaultValue: false,
            description: 'A sleek, grey theme which will make you love the site even more'
        });
        settings.on('changed.darkenedMode', value => value === true ? this.loadDark() : this.unloadDark());
    }

    loadDark() {
        if (settings.get('darkenedMode') !== true || !$('body').attr('data-page')) return;

        const pageKind = $('body').data('page').split('#')[0];
        const allowedPages = ['ember', 'message', 'chat', 'user'];

        if (allowedPages.indexOf(pageKind) !== -1) {
            const darkCSS = document.createElement('link');
            darkCSS.setAttribute('href', `https://cdn.betterttv.net/css/betterttv-dark.css?${debug.version}`);
            darkCSS.setAttribute('type', 'text/css');
            darkCSS.setAttribute('rel', 'stylesheet');
            darkCSS.setAttribute('id', 'bttvDarkTwitch');
            $('body').append(darkCSS);

            // Messages Delete Icon Fix (Old Messages Inbox)
            $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g18_trash-00000080.png"]')
                .attr('src', 'https://cdn.betterttv.net/assets/icons/delete.png');
            $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g16_trash-00000020.png"]')
                .attr('src', 'https://cdn.betterttv.net/assets/icons/delete.png')
                .attr('width', '16')
                .attr('height', '16');
        }
    }

    unloadDark() {
        $('#bttvDarkTwitch').remove();
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
