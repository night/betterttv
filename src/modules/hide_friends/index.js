const css = require('../../utils/css');
const watcher = require('../../watcher');
const settings = require('../../settings');

class HideFriendsModule {
    constructor() {
        settings.add({
            id: 'hideFriends',
            name: 'Hide Friends',
            defaultValue: false,
            description: 'Hides the friends list from the left sidebar'
        });
        settings.add({
            id: 'hideFriendsChatActivity',
            name: 'Hide Friend Activity in Chat',
            defaultValue: false,
            description: 'Hides things like "friend has started watching" in chat'
        });
        settings.on('changed.hideFriends', () => this.toggleFriendsList());
        watcher.on('chat.message', ($el, messageObj) => this.hideChatLine($el, messageObj));
        this.toggleFriendsList();
    }

    toggleFriendsList() {
        if (settings.get('hideFriends') === true) {
            css.load('hide-friends');
        } else {
            css.unload('hide-friends');
        }
    }

    hideChatLine($el, messageObj) {
        const isFriendMessage = / (VoHiYo|HeyGuys)$/.test(messageObj.message);
        if (!isFriendMessage || messageObj.style !== 'admin') return;
        $el.hide();
    }
}

module.exports = new HideFriendsModule();
