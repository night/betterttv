import debounce from 'lodash.debounce';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {AutoClaimFlags, SettingIds} from '../../constants.js';
import twitch from '../../utils/twitch.js';
import {hasFlag} from '../../utils/flags.js';

const AUTO_CLAIM_SELECTOR = '.chat-private-callout__header-segment';
const AUTO_CLAIM_BUTTON_SELECTOR = `${AUTO_CLAIM_SELECTOR} button[class*="ScCoreButtonPrimary"]`;

let autoClaimListener;

function handleClaim(node) {
  const autoClaim = settings.get(SettingIds.AUTO_CLAIM);

  const eligibleEventTypes = [];
  if (hasFlag(autoClaim, AutoClaimFlags.DROPS)) {
    eligibleEventTypes.push('drop');
  }
  if (hasFlag(autoClaim, AutoClaimFlags.MOMENTS)) {
    eligibleEventTypes.push('moment');
  }

  const event = twitch.getPrivateCalloutEvent(node);
  if (event == null || !['drop', 'community-moment'].includes(event.type)) {
    return;
  }

  const claimButton = document.querySelector(AUTO_CLAIM_BUTTON_SELECTOR);
  if (claimButton == null) {
    return;
  }

  claimButton.click();
}

const handleClaimDebounced = debounce(handleClaim, 1000);

class AutoClaimModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_CLAIM}`, () => this.load());
  }

  load() {
    const autoClaim = settings.get(SettingIds.AUTO_CLAIM);
    const autoClaimDrops = hasFlag(autoClaim, AutoClaimFlags.DROPS);
    const autoClaimMoments = hasFlag(autoClaim, AutoClaimFlags.MOMENTS);
    const shouldAutoClaim = autoClaimDrops | autoClaimMoments;

    if (!shouldAutoClaim && autoClaimListener != null) {
      autoClaimListener();
      autoClaimListener = undefined;
    } else if (shouldAutoClaim && autoClaimListener == null) {
      autoClaimListener = domObserver.on(AUTO_CLAIM_SELECTOR, (node, isConnected) => {
        if (!isConnected) return;
        handleClaimDebounced(node);
      });
    }
  }
}

export default new AutoClaimModule();
