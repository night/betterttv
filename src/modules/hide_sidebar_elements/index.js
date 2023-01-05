import $ from 'jquery';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';
import {PlatformTypes, SettingIds, SidebarFlags} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';

let removeFeaturedChannelsListener;
let removeOfflineFollowedChannelsListener;

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.toggleFeaturedChannels();
      this.toggleAutoExpandChannels();
      this.toggleOfflineFollowedChannels();
    });
    watcher.on('load', () => {
      this.toggleFeaturedChannels();
      this.toggleAutoExpandChannels();
      this.toggleOfflineFollowedChannels();
    });
  }

  toggleFeaturedChannels() {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.FEATURED_CHANNELS)) {
      if (removeFeaturedChannelsListener) return;

      removeFeaturedChannelsListener = domObserver.on(
        '.side-nav-section a[data-test-selector="recommended-channel"], .side-nav-section a[data-test-selector="similarity-channel"], .side-nav-section a[data-test-selector="popular-channel"], .side-nav-card[data-test-selector="side-nav-card-collapsed"]',
        (node, isConnected) => {
          if (!isConnected) return;

          const sidebarSection = twitch.getSidebarSection(node);
          if (!['SIMILAR_SECTION', 'RECOMMENDED_SECTION', 'POPULAR_SECTION'].includes(sidebarSection?.type)) {
            return;
          }
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

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideSidebarElementsModule()]);
