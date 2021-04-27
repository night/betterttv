import $ from 'jquery';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';

const CLAIM_BUTTON_SELECTOR = '.claimable-bonus__icon';

let removeChannelPointsListener;

class ChannelPoints {
  constructor() {
    settings.add({
      id: 'channelPoints',
      category: 'misc',
      type: 2,
      options: {
        choices: ['Channel Points Enabled', 'Auto-Claim Channel Points', 'Highlighted Messages'],
      },
      name: 'Channel Points',
      defaultValue: [0, 2],
      description: 'Modify/remove channel point features',
    });

    settings.on('changed.channelPoints', (newValues, prevValues) => {
      this.toggleElements(newValues);
    });

    this.toggleElements(settings.get('channelPoints'));
  }

  toggleElements(values) {
    this.showChannelPoints(values.includes(0));
    this.autoClaimBonusChannelPoints(values.includes(1));
    this.showChannelPointMessageHighlights(values.includes(2));
  }

  autoClaimBonusChannelPoints(enable) {
    if (enable) {
      if (removeChannelPointsListener) return;

      removeChannelPointsListener = domObserver.on(CLAIM_BUTTON_SELECTOR, (node, isConnected) => {
        if (!isConnected) return;

        node.click();
      });

      return;
    }

    if (!removeChannelPointsListener) return;

    removeChannelPointsListener();
    removeChannelPointsListener = undefined;
  }

  showChannelPoints(enable) {
    $('body').toggleClass('bttv-hide-channel-points', !enable);
  }

  showChannelPointMessageHighlights(enable) {
    $('.chat-scrollable-area__message-container').toggleClass(
      'bttv-disable-channel-points-message-highlights',
      !enable
    );
  }
}

export default new ChannelPoints();
