import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {SettingIds} from '../../constants.js';

const RAID_BANNER_SELECTOR = '[data-test-selector="raid-banner"]';
const RAID_LEAVE_BUTTON_SELECTOR = `${RAID_BANNER_SELECTOR} button[class*="ScCoreButtonSecondary"]`;

class AutoJoinRaidsModule {
  raidListener;

  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_JOIN_RAIDS}`, () => this.load());
  }

  load() {
    const autoJoin = settings.get(SettingIds.AUTO_JOIN_RAIDS);

    if (autoJoin && this.raidListener) {
      this.raidListener();
      this.raidListener = null;
    } else if (!autoJoin && !this.raidListener) {
      this.raidListener = domObserver.on(RAID_BANNER_SELECTOR, () => this.leaveRaid());
    }
  }

  leaveRaid() {
    const leaveButton = document.querySelectorAll(`${RAID_LEAVE_BUTTON_SELECTOR}`)[0];

    if (leaveButton) {
      leaveButton.click();
    }
  }
}

export default new AutoJoinRaidsModule();
