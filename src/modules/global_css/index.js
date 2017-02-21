const $ = require('jquery');
const cdn = require('../../utils/cdn');
const css = require('../../utils/css');
const watcher = require('../../watcher');
const settings = require('../../settings');

class GlobalCSSModule {
    constructor() {
        settings.add({
            id: 'leftSideChat',
            name: 'Left Side Chat',
            defaultValue: false,
            description: 'Moves the chat to the left of the player'
        });
        settings.on('changed.leftSideChat', () => this.toggleLeftSideChat());
        watcher.on('load', () => this.branding());
        this.globalCSS();
        this.branding();
        this.toggleLeftSideChat();
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

    toggleLeftSideChat() {
        $('body').toggleClass('swap-chat', settings.get('leftSideChat'));
    }
}

module.exports = new GlobalCSSModule();
