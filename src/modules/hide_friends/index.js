import $ from 'jquery';
import {SettingIds, SidebarFlags} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';

class HideFriendsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => this.toggleFriendsList());
    this.toggleFriendsList();
  }

  toggleFriendsList() {
    $('body').toggleClass('bttv-hide-friends', !hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.FRIENDS));
  }
}

export default new HideFriendsModule();
