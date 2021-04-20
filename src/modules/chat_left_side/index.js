import $ from 'jquery';
import settings from '../../settings.js';

class ChatLeftSide {
  constructor() {
    settings.add({
      id: 'leftSideChat',
      name: 'Left Side Chat',
      defaultValue: false,
      description: 'Moves chat to the left of the player',
    });
    settings.on('changed.leftSideChat', () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    $('body').toggleClass('bttv-swap-chat', settings.get('leftSideChat'));
  }
}

export default new ChatLeftSide();
