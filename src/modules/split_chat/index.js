const settings = require('../../settings');

let alternateBackground = false;

class SplitChatModule {
    constructor() {
        settings.add({
            id: 'splitChat',
            name: 'Split Chat',
            defaultValue: false,
            description: 'Easily distinguish between messages from different users in chat'
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

module.exports = new SplitChatModule();
