import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';

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
        if (!isConnected || node.className.includes('ScCoreButtonDestructive')) return;

        node.click();
      });

      return;
    }

    if (!removeChannelPointsListener) return;

    removeChannelPointsListener();
    removeChannelPointsListener = undefined;
  }

  loadHideChannelPoints() {
    document.body.classList.toggle(
      'bttv-hide-channel-points',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.CHANNEL_POINTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChannelPoints()]);
