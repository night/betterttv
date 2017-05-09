const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class DisableNameColorsModule {
    constructor() {
        settings.add({
            id: 'disableUsernameColors',
            name: 'Disable Name Colors',
            defaultValue: false,
            description: 'Disables colors in chat (useful for those who may suffer from color blindness)'
        });
        settings.on('changed.disableUsernameColors', () => this.load());
        watcher.on('load.chat', () => this.load());
    }

    load() {
        const $chatroom = $('.ember-chat .chat-room');
        $chatroom.removeClass('no-name-colors');
        if (settings.get('disableUsernameColors') === false) return;
        $chatroom.addClass('no-name-colors');
    }
}

module.exports = new DisableNameColorsModule();
