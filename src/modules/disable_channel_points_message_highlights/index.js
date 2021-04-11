import $ from 'jquery';
import settings from '../../settings';
import watcher from '../../watcher';

class DisableChannelPointsMessageHighlightsModule {
    constructor() {
        settings.add({
            id: 'disableChannelPointsMessageHighlights',
            name: 'Disable Channel Points Message Highlights',
            defaultValue: false,
            description: 'Disables highlighting of the "Highlight my message" messages'
        });
        settings.on('changed.disableChannelPointsMessageHighlights', () => this.load());
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $('.chat-scrollable-area__message-container').toggleClass('bttv-disable-channel-points-message-highlights', settings.get('disableChannelPointsMessageHighlights'));
    }
}

export default new DisableChannelPointsMessageHighlightsModule();
