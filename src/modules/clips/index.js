const $ = require('jquery');
const css = require('../../utils/css');
const settings = require('../../settings');
const watcher = require('../../watcher');

const SETTING_KEY = 'clipsDark';
const DARK_CLASS = 'dark';
const $body = $('body');

class GlobalCSSModule {
    constructor() {
        watcher.on('load.clips', () => this.load());
    }

    load() {
        css.load('clips-dark');
        this.darkenToggleButton();

        if (!settings.get(SETTING_KEY)) return;
        $body.addClass(DARK_CLASS);
    }

    darkenToggleButton() {
        const toggleButton = $('<a />');
        toggleButton.addClass('darkToggleButton');
        toggleButton.text('Toggle Dark Mode');
        toggleButton.on('click', () => this.toggleDarkMode());
        $body.append(toggleButton);
    }

    toggleDarkMode() {
        const newValue = !(settings.get(SETTING_KEY) || false);
        $body.toggleClass(DARK_CLASS, newValue);
        settings.set(SETTING_KEY, newValue);
    }
}

module.exports = new GlobalCSSModule();
