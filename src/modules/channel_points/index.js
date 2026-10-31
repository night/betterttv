import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';

// the newer chat layout leaves no stable class on the claim button, so watch transitions and bail outside the points summary
const CLAIM_BONUS_TRANSITION_SELECTOR = '.tw-transition';
const COMMUNITY_POINTS_SUMMARY_SELECTOR = '[data-test-selector="community-points-summary"]';

let removeChannelPointsListener;
// nested transitions emit together on mount, so remember which buttons were already clicked
const clickedClaimButtons = new WeakSet();

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
        if (claimButton == null || clickedClaimButtons.has(claimButton)) return;

        const claimableBonus = twitch.getClaimableBonus(claimButton);
        if (claimableBonus == null || claimableBonus.state.error) return;

        clickedClaimButtons.add(claimButton);
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
