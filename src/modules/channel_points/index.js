import $ from 'jquery';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {SettingIds, ChannelPointsFlags} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

const CLAIM_BUTTON_SELECTOR = '.claimable-bonus__icon';

let removeChannelPointsListener;

class ChannelPoints {
  constructor() {
    this.loadAutoClaimBonusChannelPoints();
    this.loadHideChannelPoints();

    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => {
      this.loadAutoClaimBonusChannelPoints();
      this.loadHideChannelPoints();
    });
  }

  loadAutoClaimBonusChannelPoints() {
    if (hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.AUTO_CLAIM)) {
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
    $('body').toggleClass(
      'bttv-hide-channel-points',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.CHANNEL_POINTS)
    );
  }
}

export default new ChannelPoints();
