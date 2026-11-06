import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';

// twitch keeps the claim transition mounted and only renders the button into it when a bonus shows up,
// so watch the points summary subtree rather than waiting for a new transition node
const COMMUNITY_POINTS_SUMMARY_SELECTOR = '.community-points-summary';
const CLAIM_BUTTON_SELECTOR = '.tw-transition button';

let removeChannelPointsListener;
const summaryObservers = new Map();
// a claim can trigger several mutations before the button unmounts, so remember which buttons were already clicked
const clickedClaimButtons = new WeakSet();

function claimBonus(summary) {
  for (const claimButton of summary.querySelectorAll(CLAIM_BUTTON_SELECTOR)) {
    if (clickedClaimButtons.has(claimButton)) continue;

    const claimableBonus = twitch.getClaimableBonus(claimButton);
    if (claimableBonus == null || claimableBonus.state.error) continue;

    clickedClaimButtons.add(claimButton);
    claimButton.click();
  }
}

function observeSummary(summary) {
  if (summaryObservers.has(summary)) return;

  const observer = new window.MutationObserver(() => claimBonus(summary));
  observer.observe(summary, {childList: true, subtree: true});
  summaryObservers.set(summary, observer);

  claimBonus(summary);
}

function unobserveSummary(summary) {
  summaryObservers.get(summary)?.disconnect();
  summaryObservers.delete(summary);
}

function unobserveAllSummaries() {
  for (const summary of summaryObservers.keys()) {
    unobserveSummary(summary);
  }
}

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

      removeChannelPointsListener = domObserver.on(COMMUNITY_POINTS_SUMMARY_SELECTOR, (node, isConnected) => {
        if (isConnected) {
          observeSummary(node);
        } else {
          unobserveSummary(node);
        }
      });

      return;
    }

    if (!removeChannelPointsListener) return;

    removeChannelPointsListener();
    removeChannelPointsListener = undefined;
    unobserveAllSummaries();
  }

  loadHideChannelPoints() {
    document.body.classList.toggle(
      'bttv-hide-channel-points',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.CHANNEL_POINTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChannelPoints()]);
