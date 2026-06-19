import {PlatformTypes, SettingIds} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const RAID_BANNER_SELECTOR = '[data-test-selector="raid-banner"]';
const RAID_LEAVE_BUTTON_SELECTOR = `${RAID_BANNER_SELECTOR} button[class*="ScCoreButton"]`;

class AutoJoinRaidsModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_JOIN_RAIDS}`, () => this.load());
    settings.on(`changed.${SettingIds.AUTO_JOIN_RAIDS_WHITELISTED_CHANNELS}`, () => this.load());
    settings.on(`changed.${SettingIds.AUTO_JOIN_RAIDS_BLACKLISTED_CHANNELS}`, () => this.load());
    this.removeRaidListener = null;
  }

  load() {
    const settingEnabled = settings.get(SettingIds.AUTO_JOIN_RAIDS);
    const channels = settingEnabled
      ? settings.get(SettingIds.AUTO_JOIN_RAIDS_WHITELISTED_CHANNELS)
      : settings.get(SettingIds.AUTO_JOIN_RAIDS_BLACKLISTED_CHANNELS);
    const currentChannelName = twitch.getCurrentChat()?.props?.channelLogin;

    let autoJoin = channels.map((channel) => channel.toLowerCase()).includes(currentChannelName);
    if (settingEnabled) {
      autoJoin = !autoJoin;
    }

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
