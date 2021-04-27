import $ from 'jquery';
import settings from '../../settings.js';

class ChatPlacement {
  constructor() {
    settings.add({
      id: 'chatPlacement',
      type: 5,
      category: 'chat',
      options: {
        choices: ['Right', 'Left'],
      },
      name: 'Chat Position',
      defaultValue: 0,
      description: 'Set the chat position',
    });

    settings.on('changed.chatPlacement', (value) => this.toggleLeftSideChat(value === 1));
    this.toggleLeftSideChat(settings.get('chatPlacement') === 1);
  }

  toggleLeftSideChat(enable) {
    $('body').toggleClass('bttv-swap-chat', enable);
  }
}

export default new ChatPlacement();
