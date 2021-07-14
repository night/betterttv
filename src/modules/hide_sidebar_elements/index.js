import $ from 'jquery';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {SettingIds, SidebarFlags} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

let removeFeaturedChannelsListener;
let removeOfflineFollowedChannelsListener;

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.toggleFeaturedChannels();
      this.toggleAutoExpandChannels();
      this.toggleRecommendedFriends();
      this.toggleOfflineFollowedChannels();
    });
    watcher.on('load', () => {
      this.toggleFeaturedChannels();
      this.toggleAutoExpandChannels();
      this.toggleRecommendedFriends();
      this.toggleOfflineFollowedChannels();
    });
  }

  toggleFeaturedChannels() {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.FEATURED_CHANNELS)) {
      if (removeFeaturedChannelsListener) return;

      removeFeaturedChannelsListener = domObserver.on(
        '.side-nav-section a[data-test-selector="recommended-channel"], .side-nav-section a[data-test-selector="similarity-channel"], .side-nav-section a[data-test-selector="popular-channel"]',
        (node, isConnected) => {
          if (!isConnected) return;
          $(node).addClass('bttv-hide-featured-channels');
        },
        {useParentNode: true}
      );
      return;
    }

    if (!removeFeaturedChannelsListener) return;

    removeFeaturedChannelsListener();
    removeFeaturedChannelsListener = undefined;
    $('.side-nav-section').removeClass('bttv-hide-featured-channels');
  }

  toggleAutoExpandChannels() {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.AUTO_EXPAND_CHANNELS)) return;
    setTimeout(() => {
      const $firstChannelLink = $('a.side-nav-card__link[data-a-id="followed-channel-0"]');
      if ($firstChannelLink.length === 0) return;
      $('.side-nav button[data-a-target="side-nav-show-more-button"]').first().trigger('click');
    }, 1000);
  }

  toggleRecommendedFriends() {
    $('body').toggleClass(
      'bttv-hide-recommended-friends',
      !hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.RECOMMENDED_FRIENDS)
    );
  }

  toggleOfflineFollowedChannels() {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.OFFLINE_FOLLOWED_CHANNELS)) {
      if (removeOfflineFollowedChannelsListener) return;

      removeOfflineFollowedChannelsListener = domObserver.on(
        '.side-nav-card .side-nav-card__avatar--offline',
        (node, isConnected) => {
          if (!isConnected) return;
          $(node).addClass('bttv-hide-followed-offline');
        },
        {useParentNode: true}
      );
      return;
    }

    if (!removeOfflineFollowedChannelsListener) return;

    removeOfflineFollowedChannelsListener();
    removeOfflineFollowedChannelsListener = undefined;
    $('.side-nav-card').removeClass('bttv-hide-followed-offline');
  }
}

export default new HideSidebarElementsModule();
