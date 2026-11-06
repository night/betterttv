import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';

// the classic claim button wraps a stable .claimable-bonus__icon, so it's caught however twitch inserts it.
// the OneChat button has no stable class, so fall back to the transition twitch mounts around it.
const CLAIM_BONUS_SELECTOR = '.claimable-bonus__icon, .tw-transition';
const COMMUNITY_POINTS_SUMMARY_SELECTOR = '[data-test-selector="community-points-summary"]';

let removeChannelPointsListener;
// nested transitions and the icon emit together on mount, so remember which buttons were already clicked
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

      removeChannelPointsListener = domObserver.on(CLAIM_BONUS_SELECTOR, (node, isConnected) => {
        if (!isConnected || node.closest(COMMUNITY_POINTS_SUMMARY_SELECTOR) == null) return;

        const claimButton = node.closest('button') ?? node.querySelector('button');
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
