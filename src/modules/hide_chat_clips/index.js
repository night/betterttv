const settings = require('../../settings');
const css = require('../../utils/css');

class HideChatClipsModule {
    constructor() {
        settings.add({
            id: 'hideChatClips',
            name: 'Hide Chat Clips',
            defaultValue: false,
            description: 'Hides clips embeds in chat'
        });
        settings.on('changed.hideChatClips', value => value === true ? this.load() : this.unload());
        if (settings.get('hideChatClips') === true) this.load();
    }

    load() {
        css.load('hide-chat-clips');
    }

    unload() {
        css.unload('hide-chat-clips');
    }
}

module.exports = new HideChatClipsModule();
