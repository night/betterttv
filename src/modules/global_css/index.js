const $ = require('jquery');
const cdn = require('../../utils/cdn');
const extension = require('../../utils/extension');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const TWITCH_THEME_CHANGED_DISPATCH_TYPE = 'core.ui.THEME_CHANGED';
const TWITCH_THEME_STORAGE_KEY = 'twilight.theme';
const TwitchThemes = {
    LIGHT: 0,
    DARK: 1
};

let connectStore;

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
        settings.on('changed.darkenedMode', value => this.setTwitchTheme(value));

        this.loadTwitchThemeObserver();
        this.dismissPinnedCheers();
    }

    setTwitchTheme(value) {
        if (!connectStore) return;

        const theme = value === true ? TwitchThemes.DARK : TwitchThemes.LIGHT;
        try {
            localStorage.setItem(TWITCH_THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch (_) {}
        connectStore.dispatch({
            type: TWITCH_THEME_CHANGED_DISPATCH_TYPE,
            theme
        });
    }

    loadTwitchThemeObserver() {
        connectStore = twitch.getConnectStore();
        if (!connectStore) return;

        connectStore.subscribe(() => {
            const isDarkMode = connectStore.getState().ui.theme === TwitchThemes.DARK;
            if (settings.get('darkenedMode') !== isDarkMode) {
                settings.set('darkenedMode', isDarkMode, false, true);
            }
        });
    }

    globalCSS() {
        const css = document.createElement('link');
        css.setAttribute('href', extension.url('betterttv.css', true));
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

    dismissPinnedCheers() {
        $('body').on('click', '.pinned-cheer', e => {
            if (e.target !== $('.pinned-cheer .pinned-cheer__bounding-box')[0]) return;
            if (e.target.offsetWidth - e.offsetX > 15 || e.offsetY > 15) return;
            $('.pinned-cheer').hide();
        });
    }
}

module.exports = new GlobalCSSModule();
