const $ = require('jquery');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

class GlobalCSSModule {
    constructor() {
        this.globalCSS();

        watcher.on('load', () => this.branding());
        this.branding();

        settings.add({
            id: 'darkenedMode',
            name: 'Dark Theme',
            defaultValue: false,
            description: 'Enable Twitch\'s dark theme'
        });

        settings.on('changed.darkenedMode', isDark => this.darkChange(isDark));
        watcher.on('dark.change', isDark => this.darkChange(isDark));

        this.darkSet(settings.get('darkenedMode'));
    }

    darkSet(isDark) {
        const connectRoot = twitch.getConnectRoot();
        if (!connectRoot) return;
        connectRoot._context.store.dispatch({type: 'core.ui.THEME_CHANGED', theme: (isDark ? 1 : 0)});
    }

    darkChange(isDark) {
        this.darkSet(isDark);
        settings.set('darkenedMode', isDark, false);
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
