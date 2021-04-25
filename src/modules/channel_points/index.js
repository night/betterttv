import $ from 'jquery';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';

const CLAIM_BUTTON_SELECTOR = '.claimable-bonus__icon';

let removeChannelPointsListener;

class ChannelPoints {
  constructor() {
    settings.add({
      id: 'autoClaimBonusChannelPoints',
      category: 'misc',
      name: 'Auto-Claim Bonus Channel Points',
      defaultValue: false,
      description: 'Automatically claim bonus channel points',
    });
    settings.add({
      id: 'hideChannelPoints',
      category: 'misc',
      name: 'Hide Channel Points',
      defaultValue: false,
      description: 'Hides channel points from the chat UI to reduce clutter',
    });

    this.loadAutoClaimBonusChannelPoints();
    this.loadHideChannelPoints();

    settings.on('changed.autoClaimBonusChannelPoints', () => this.loadAutoClaimBonusChannelPoints());
    settings.on('changed.hideChannelPoints', () => this.loadHideChannelPoints());
  }

  loadAutoClaimBonusChannelPoints() {
    if (settings.get('autoClaimBonusChannelPoints')) {
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

  loadHideChannelPoints() {
    $('body').toggleClass('bttv-hide-channel-points', settings.get('hideChannelPoints'));
  }
}

export default new ChannelPoints();
