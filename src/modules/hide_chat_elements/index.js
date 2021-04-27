import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import domObserver from '../../observers/dom.js';

let removeCommunityHighlightsListener;

class HideChatElements {
  constructor() {
    settings.add({
      id: 'hideChatElements',
      type: 2,
      options: {
        choices: ['Bits', 'Replies', 'Clips', 'Greetings', 'Subscriptions', 'Community Highlights'],
      },
      category: 'chat',
      name: 'Chat Features',
      defaultValue: [0, 1, 2, 3, 4, 5],
      description: 'Disable in-chat elements',
    });

    settings.on('changed.hideChatElements', (newValues, prevValues) => {
      this.toggleElements(newValues);
    });

    watcher.on('load', () => {
      this.toggleElements(settings.get('hideChatElements'));
    });
  }

  toggleElements(values) {
    this.showBits(values.includes(0));
    this.showChatReplies(values.includes(1));
    this.showChatClips(values.includes(2));
    this.showCommunityHighlights(values.includes(5));
  }

  showBits(enable) {
    $('body').toggleClass('bttv-hide-bits', !enable);
  }

  showChatReplies(enable) {
    $('body').toggleClass('bttv-hide-chat-replies', !enable);
  }

  showChatClips(enable) {
    $('body').toggleClass('bttv-hide-chat-clips', !enable);
  }

  showCommunityHighlights(enable) {
    if (!enable) {
      if (removeCommunityHighlightsListener) return;

      removeCommunityHighlightsListener = domObserver.on('.community-highlight-stack__card', (node, isConnected) => {
        if (!isConnected) return;
        const $node = $(node);
        if ($node.find('.channel-poll__more-icon').length > 0) return;
        if ($node.find('button[data-test-selector="community-prediction-highlight-header__action-button"]').length > 0)
          return;
        $node.addClass('bttv-hide-community-highlights');
      });
      return;
    }

    if (!removeCommunityHighlightsListener) return;

    removeCommunityHighlightsListener();
    removeCommunityHighlightsListener = undefined;
    $('.community-highlight-stack__card').removeClass('bttv-hide-community-highlights');
  }
}

export default new HideChatElements();
