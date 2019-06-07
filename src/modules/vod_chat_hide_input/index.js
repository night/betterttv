const $ = require('jquery');
const settings = require('../../settings');

class VodChatHideInputModule {
    constructor() {
        settings.add({
            id: 'vodChatHideInput',
            name: 'Hide VOD Chat Text Input',
            defaultValue: false,
            description: 'Hides the header and text input on VOD chat'
        });

        settings.on('changed.vodChatHideInput', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-vod-chat-hide-input', settings.get('vodChatHideInput'));
    }
}

module.exports = new VodChatHideInputModule();
