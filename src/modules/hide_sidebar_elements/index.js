import {PlatformTypes, SettingIds, SidebarFlags} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import styles from './styles.module.css';

const sidebarSectionSelector = '.side-nav-section';
const offlineChannelSelector = '.side-nav-card > .side-nav-card__link--offline';

let offlineChannelObserverRemover = null;

function handleSidebarSection(node) {
  const sidebarSection = twitch.getSidebarSection(node);
  if (sidebarSection == null) {
    return;
  }

  const setting = settings.get(SettingIds.SIDEBAR);
  switch (sidebarSection.type) {
    case 'RECENTLY_VISITED_SECTION': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.RECENTLY_WATCHED_CHANNELS));
      break;
    }
    case 'RECOMMENDED_SECTION': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.RECOMMENDED_CHANNELS));
      break;
    }
    case 'SIMILAR_SECTION': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.SIMILAR_CHANNELS));
      break;
    }
    default: {
      return;
    }
  }
}

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.updateAllSidebarSections();
      this.loadOfflineChannelObserver();
      this.toggleAutoExpandChannels();
    });
    watcher.on('load', () => {
      this.updateAllSidebarSections();
      this.loadOfflineChannelObserver();
      this.toggleAutoExpandChannels();
    });
    domObserver.on(sidebarSectionSelector, (node, isConnected) => {
      if (!isConnected) return;
      handleSidebarSection(node);
    });
  }

  loadOfflineChannelObserver() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const shouldHideOfflineChannels = !hasFlag(setting, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS);

    if (shouldHideOfflineChannels && offlineChannelObserverRemover == null) {
      offlineChannelObserverRemover = domObserver.on(offlineChannelSelector, (node, isConnected) => {
        if (!isConnected) {
          return;
        }
        node.classList.add(styles.hideOfflineChannel);
      });
    }

    if (!shouldHideOfflineChannels && offlineChannelObserverRemover != null) {
      offlineChannelObserverRemover();
      offlineChannelObserverRemover = null;
      const nodes = document.getElementsByClassName(styles.hideOfflineChannel);
      for (const node of nodes) {
        node.classList.remove(styles.hideOfflineChannel);
      }
    }
  }

  updateAllSidebarSections() {
    const sidebarSections = document.querySelectorAll(sidebarSectionSelector);
    for (const section of sidebarSections) {
      handleSidebarSection(section);
    }
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
