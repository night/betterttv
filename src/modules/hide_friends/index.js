const settings = require('../../settings');
const $ = require('jquery');

class HideFriendsModule {
    constructor() {
        settings.add({
            id: 'hideFriends',
            name: 'Hide Friends',
            defaultValue: false,
            description: 'Hides the friends list from the left sidebar'
        });
        settings.on('changed.hideFriends', () => this.toggleFriendsList());
        this.toggleFriendsList();
    }

    toggleFriendsList() {
        $('body').toggleClass('bttv-hide-friends', settings.get('hideFriends'));
    }
}

module.exports = new HideFriendsModule();
