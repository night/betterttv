import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const RAID_BANNER_SELECTOR = '[data-test-selector="raid-banner"]';
const RAID_LEAVE_BUTTON_SELECTOR = `${RAID_BANNER_SELECTOR} button[class*="ScCoreButtonSecondary"]`;

class AutoJoinRaidsModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_JOIN_RAIDS}`, () => this.load());
    this.removeRaidListener = null;
  }

  load() {
    const autoJoin = settings.get(SettingIds.AUTO_JOIN_RAIDS);

    if (autoJoin && this.removeRaidListener != null) {
      this.removeRaidListener();
      this.removeRaidListener = null;
    } else if (!autoJoin && this.removeRaidListener == null) {
      this.removeRaidListener = domObserver.on(RAID_BANNER_SELECTOR, () => this.leaveRaid());
    }
  }

  leaveRaid() {
    const leaveButton = document.querySelector(RAID_LEAVE_BUTTON_SELECTOR);
    if (
      leaveButton == null ||
      ['raid-cancel-button', 'raid-now-button'].includes(leaveButton.getAttribute('data-test-selector'))
    ) {
      return;
    }

    leaveButton.click();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoJoinRaidsModule()]);
