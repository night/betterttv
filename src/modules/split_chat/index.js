const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let alternateBackground = false;

class SplitChatModule {
    constructor() {
        settings.add({
            id: 'splitChat',
            name: 'Split Chat',
            defaultValue: false,
            description: 'Easily distinguish between messages from different users in chat'
        });
        watcher.on('chat.message', ($el, msg) => {
            if (settings.get('splitChat') === false) return;

            if (twitch.getCurrentUser().name === msg.user.userLogin) {
                $el.toggleClass('bttv-own-msg-bg');
                alternateBackground = false;
            }
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
