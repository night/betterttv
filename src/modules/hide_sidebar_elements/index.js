import {PlatformTypes, SettingIds, SidebarFlags} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

const sectionObserverRemovers = {};

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.toggleRecentlyWatchedChannels();
      this.toggleRecommendedChannels();
      this.toggleSimilarChannels();
      this.toggleAutoExpandChannels();
      this.toggleOfflineFollowedChannels();
    });
    watcher.on('load', () => {
      this.toggleRecentlyWatchedChannels();
      this.toggleRecommendedChannels();
      this.toggleSimilarChannels();
      this.toggleAutoExpandChannels();
      this.toggleOfflineFollowedChannels();
    });
  }

  toggleChannels(flag, hideClass, selector, section) {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), flag)) {
      if (sectionObserverRemovers[flag] == null) {
        sectionObserverRemovers[flag] = domObserver.on(
          selector,
          (node, isConnected) => {
            if (!isConnected) {
              return;
            }
  
            const sidebarSection = twitch.getSidebarSection(node);
            if (section && section !== sidebarSection?.type) {
              return;
            }
    
            node.classList.add(hideClass);
          },
          {useParentNode: true}
        );
      }

      return;
    }

    if (sectionObserverRemovers[flag] == null) {
      return;
    }

    Array.from(document.getElementsByClassName(hideClass)).forEach((el) => el.classList.remove(hideClass));

    sectionObserverRemovers[flag]();
    delete sectionObserverRemovers[flag];
  }

  toggleRecentlyWatchedChannels() {
    this.toggleChannels(
      SidebarFlags.RECENTLY_WATCHED_CHANNELS,
      'bttv-hide-recently-watched-channels',
      '.side-nav-section a[data-a-id^="recently-watched-channel"], .side-nav-card[data-test-selector="side-nav-card-collapsed"]',
      'RECENTLY_VISITED_SECTION'
    );
  }

  toggleRecommendedChannels() {
    this.toggleChannels(
      SidebarFlags.RECOMMENDED_CHANNELS,
      'bttv-hide-recommended-channels',
      '.side-nav-section a[data-test-selector="recommended-channel"], .side-nav-card[data-test-selector="side-nav-card-collapsed"]',
      'RECOMMENDED_SECTION'
    );
  }

  toggleSimilarChannels() {
    this.toggleChannels(
      SidebarFlags.SIMILAR_CHANNELS,
      'bttv-hide-similar-channels',
      '.side-nav-section a[data-test-selector="similarity-channel"], .side-nav-card[data-test-selector="side-nav-card-collapsed"]',
      'SIMILAR_SECTION'
    );
  }

  toggleOfflineFollowedChannels() {
    this.toggleChannels(
      SidebarFlags.OFFLINE_FOLLOWED_CHANNELS,
      'bttv-hide-followed-offline',
      '.side-nav-card .side-nav-card__avatar--offline'
    );
  }

  toggleAutoExpandChannels() {
    if (!hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.AUTO_EXPAND_CHANNELS)) return;
    setTimeout(() => {
      const firstChannelLink = document.querySelector('a.side-nav-card__link[data-a-id="followed-channel-0"]');
      if (firstChannelLink == null) return;
      document.querySelector('.side-nav button[data-a-target="side-nav-show-more-button"]')?.click();
    }, 1000);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideSidebarElementsModule()]);
