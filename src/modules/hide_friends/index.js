import $ from 'jquery';
import {PlatformTypes, SettingIds, SidebarFlags} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class HideFriendsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => this.toggleFriendsList());
    this.toggleFriendsList();
  }

  toggleFriendsList() {
    $('body').toggleClass('bttv-hide-friends', !hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.FRIENDS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideFriendsModule()]);
