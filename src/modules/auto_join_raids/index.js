import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {SettingIds} from '../../constants.js';

const RAID_BANNER_SELECTOR = '[data-test-selector="raid-banner"]';
const RAID_BANNER_BUTTONS_SELECTOR = `${RAID_BANNER_SELECTOR} button`;
const LEAVE_BUTTON_TEXT = 'Leave';

class AutoJoinRaidsModule {
  raidListener;

  constructor() {
    watcher.on('load.chat', () => this.load());
  }

  load() {
    if (!this.raidListener) {
      this.raidListener = domObserver.on(RAID_BANNER_SELECTOR, () => this.handleRaid());
    }
  }

  handleRaid() {
    const autoJoin = settings.get(SettingIds.AUTO_JOIN_RAIDS);

    if (!autoJoin) {
      this.leaveRaid();
    }
  }

  leaveRaid() {
    const leaveButton = this.findLeaveButton();

    if (leaveButton) {
      leaveButton.click();
    }
  }

  findLeaveButton() {
    const elements = this.elementsContainingText(RAID_BANNER_BUTTONS_SELECTOR, LEAVE_BUTTON_TEXT);

    if (elements && elements.length) {
      return elements[0];
    }

    return null;
  }

  elementsContainingText(selector, text) {
    const elements = document.querySelectorAll(selector);

    return [].filter.call(elements, (element) => RegExp(text).test(element.textContent));
  }
}

export default new AutoJoinRaidsModule();
