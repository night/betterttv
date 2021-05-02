import $ from 'jquery';
import settings from '../../settings.js';

class HideFriendsModule {
  constructor() {
    settings.add({
      id: 'hideFriends',
      category: 'directory',
      name: 'Hide Friends',
      defaultValue: false,
      description: 'Hides the friends list in the left sidebar',
    });
    settings.on('changed.hideFriends', () => this.toggleFriendsList());
    this.toggleFriendsList();
  }

  toggleFriendsList() {
    $('body').toggleClass('bttv-hide-friends', settings.get('hideFriends'));
  }
}

export default new HideFriendsModule();
