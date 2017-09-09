const $ = require('jquery');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

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
            description: 'A sleek, dark theme which will make you love the site even more'
        });
        settings.on('changed.darkenedMode', value => value === true ? this.loadDark() : this.unloadDark());
        this.loadDark();
    }

    loadDark() {
        if (settings.get('darkenedMode') !== true) return;

        $('html').toggleClass('theme--dark', true);
        const chatDarkModeToggle = twitch.getReactElement($('#chat-settings-dark-mode')[0]);
        if (!chatDarkModeToggle) return;
        const {checked, onChange} = chatDarkModeToggle.props;
        if (checked) return;
        onChange();
    }

    unloadDark() {
        $('html').toggleClass('theme--dark', false);
        const chatDarkModeToggle = twitch.getReactElement($('#chat-settings-dark-mode')[0]);
        if (!chatDarkModeToggle) return;
        const {checked, onChange} = chatDarkModeToggle.props;
        if (!checked) return;
        onChange();
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
