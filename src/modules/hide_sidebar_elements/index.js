import {PlatformTypes, SettingIds, SidebarFlags} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import styles from './styles.module.css';

const sidebarSectionSelector = '.side-nav-section';
const offlineChannelSelector = '.side-nav-card';

let offlineChannelObserverRemover = null;
let sidebarSectionObserverRemover = null;

function toggleSidebarSectionClass(node, flags) {
  const sidebarSection = twitch.getSidebarSection(node);
  if (sidebarSection == null) {
    return;
  }

  const setting = flags ?? settings.get(SettingIds.SIDEBAR);
  switch (sidebarSection.sectionId ?? /* deprecated */ sidebarSection.type) {
    /* deprecated */
    case 'RECENTLY_VISITED_SECTION': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.RECENTLY_WATCHED_CHANNELS));
      break;
    }
    /* deprecated */
    case 'RECOMMENDED_SECTION':
    case 'provider-side-nav-recommended-streams-1': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.RECOMMENDED_CHANNELS));
      break;
    }
    /* deprecated */
    case 'SIMILAR_SECTION':
    case 'provider-side-nav-similar-streamer-currently-watching-1': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.SIMILAR_CHANNELS));
      break;
    }
    case 'provider-sidenav-recommended-categories-default-1': {
      node.classList.toggle(styles.hide, !hasFlag(setting, SidebarFlags.RECOMMENDED_CATEGORIES));
      break;
    }
    default: {
      break;
    }
  }
}

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.loadHideOfflineChannels();
      this.loadHideSidebarElements();
      this.toggleAutoExpandChannels();
      this.loadHideStories();
    });
    watcher.on('load', () => {
      this.loadHideOfflineChannels();
      this.loadHideSidebarElements();
      this.toggleAutoExpandChannels();
      this.loadHideStories();
    });
  }

  loadHideSidebarElements() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const hideRecentlyWatched = !hasFlag(setting, SidebarFlags.RECENTLY_WATCHED_CHANNELS);
    const hideRecommended = !hasFlag(setting, SidebarFlags.RECOMMENDED_CHANNELS);
    const hideSimilar = !hasFlag(setting, SidebarFlags.SIMILAR_CHANNELS);
    const enabled = hideRecentlyWatched || hideRecommended || hideSimilar;

    if (enabled && sidebarSectionObserverRemover == null) {
      sidebarSectionObserverRemover = domObserver.on(sidebarSectionSelector, (node, isConnected) => {
        if (!isConnected) {
          return;
        }
        toggleSidebarSectionClass(node, setting);
      });
    }

    if (!enabled && sidebarSectionObserverRemover != null) {
      sidebarSectionObserverRemover();
      sidebarSectionObserverRemover = null;
    }

    const sidebarSections = document.querySelectorAll(sidebarSectionSelector);
    for (const section of sidebarSections) {
      toggleSidebarSectionClass(section, setting);
    }
  }

  loadHideStories() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const enabled = hasFlag(setting, SidebarFlags.STORIES);
    document.body.classList.toggle(styles.hideStories, !enabled);
  }

  loadHideOfflineChannels() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const shouldHideOfflineChannels = !hasFlag(setting, SidebarFlags.OFFLINE_FOLLOWED_CHANNELS);

    if (shouldHideOfflineChannels && offlineChannelObserverRemover == null) {
      offlineChannelObserverRemover = domObserver.on(offlineChannelSelector, (node, isConnected) => {
        if (!isConnected) {
          return;
        }
        const offlineAvatars = node.querySelectorAll('.side-nav-card__avatar--offline');
        for (const offlineAvatar of offlineAvatars) {
          offlineAvatar.closest('.side-nav-card')?.classList.add(styles.hideOfflineChannel);
        }
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
