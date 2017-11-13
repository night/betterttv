const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HideConversationsModule {
    constructor() {
        settings.add({
            id: 'disableWhispers',
            name: 'Hide Whispers',
            defaultValue: false,
            description: 'Disables the Twitch whisper feature and hides any whispers you receive'
        });
        settings.add({
            id: 'hideConversations',
            name: 'Hide Whispers When Inactive',
            defaultValue: false,
            description: 'Only show whispers on mouseover or when there\'s a new message'
        });
        settings.on('changed.disableWhispers', () => this.toggleHide());
        settings.on('changed.hideConversations', () => this.toggleAutoHide());
        watcher.on('load', () => {
            this.toggleHide();
            this.toggleAutoHide();
        });
    }

    toggleHide() {
        $('body').toggleClass('bttv-hide-conversations', settings.get('disableWhispers'));
    }

    toggleAutoHide() {
        $('body').toggleClass('bttv-auto-hide-conversations', settings.get('hideConversations'));
    }
}

module.exports = new HideConversationsModule();
