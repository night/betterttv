import settings from '../../settings';

let alternateBackground = false;

class SplitChatModule {
    constructor() {
        settings.add({
            id: 'splitChat',
            name: 'Split Chat',
            defaultValue: false,
            description: 'Alternates backgrounds between messages in chat to improve readability'
        });
    }

    render($el) {
        if (settings.get('splitChat') === false) return;

        if (alternateBackground) {
            $el.toggleClass('bttv-split-chat-alt-bg');
        }
        alternateBackground = !alternateBackground;
    }
}

export default new SplitChatModule();
