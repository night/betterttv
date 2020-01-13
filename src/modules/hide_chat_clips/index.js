const $ = require('jquery');
const settings = require('../../settings');

class HideChatClipsModule {
    constructor() {
        settings.add({
            id: 'hideChatClips',
            name: 'Hide Chat Clips',
            defaultValue: false,
            description: 'Hides clips embeds in chat'
        });
        settings.on('changed.hideChatClips', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-chat-clips', settings.get('hideChatClips'));
    }
}

module.exports = new HideChatClipsModule();
