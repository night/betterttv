import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';

// twitch's newer chat layout strips every stable class off the claim button, but it always mounts in a new transition
const CLAIM_BONUS_TRANSITION_SELECTOR = '.tw-transition';
const COMMUNITY_POINTS_SUMMARY_SELECTOR = '[data-test-selector="community-points-summary"]';

let removeChannelPointsListener;
let lastClaimButton;

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

      removeChannelPointsListener = domObserver.on(CLAIM_BONUS_TRANSITION_SELECTOR, (node, isConnected) => {
        if (!isConnected || node.closest(COMMUNITY_POINTS_SUMMARY_SELECTOR) == null) return;

        const claimButton = node.querySelector('button');
        if (claimButton == null || claimButton === lastClaimButton) return;

        const claimableBonus = twitch.getClaimableBonus(claimButton);
        if (claimableBonus == null || claimableBonus.state.error) return;

        lastClaimButton = claimButton;
        claimButton.click();
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
