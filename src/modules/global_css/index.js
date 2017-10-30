const $ = require('jquery');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const CHAT_SETTINGS_DARK_TOGGLE_SELECTOR = '#chat-settings-dark-mode';

function toggleDarkChat(value) {
    const chatDarkModeToggle = twitch.getReactElement($(CHAT_SETTINGS_DARK_TOGGLE_SELECTOR)[0]);
    if (!chatDarkModeToggle) return;
    const {checked, onChange} = chatDarkModeToggle.props;
    if ((!checked && !value) || (checked && value)) return;
    onChange();
}

class GlobalCSSModule {
    constructor() {
        this.globalCSS();

        watcher.on('load', () => this.branding());
        watcher.on('load.chat', () => this.loadDark());
        this.branding();

        settings.add({
            id: 'darkenedMode',
            name: 'Dark Theme',
            defaultValue: false,
            description: 'Enable Twitch\'s dark theme'
        });
        settings.on('changed.darkenedMode', () => this.loadDark());
        this.loadDark();
    }

    loadDark() {
        const value = settings.get('darkenedMode');
        $('html').toggleClass('theme--dark', value);
        toggleDarkChat(value);
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
