import $ from 'jquery';
import settings from '../../settings.js';

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

export default new HideChatClipsModule();
