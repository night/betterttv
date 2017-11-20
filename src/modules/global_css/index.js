const $ = require('jquery');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const DISPATCH_TYPE = 'core.ui.THEME_CHANGED';
const THEMES = {
    LIGHT: 0,
    DARK: 1
};

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
        settings.on('changed.darkenedMode', val => this.setTwitchTheme(val));

        this.setTwitchTheme(settings.get('darkenedMode'));
        this.darkObserver();
    }

    setTwitchTheme(val) {
        const connectRoot = twitch.getConnectRoot();
        if (!connectRoot) return;
        connectRoot._context.store.dispatch({type: DISPATCH_TYPE, theme: +val});
    }

    darkObserver() {
        const connectRoot = twitch.getConnectRoot();
        if (!connectRoot) return;
        const {store} = connectRoot._context;
        store.subscribe(() => {
            const isDarkMode = store.getState().ui.theme === THEMES.DARK;
            if (settings.get('darkenedMode') !== isDarkMode) {
                settings.set('darkenedMode', isDarkMode);
            }
        });
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
