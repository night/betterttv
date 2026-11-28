import {PlatformTypes, SettingIds, SidebarFlags} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';
import styles from './styles.module.css';

const sidebarSectionSelector = '.side-nav-section';
const offlineChannelSelector = '.side-nav-card';

// Twitch appends experiment and version suffixes to these ids (e.g.
// provider-sidenav-recommended-categories-followedrecs-gta6-1), so sections are matched by prefix.
const SIDEBAR_SECTION_FLAGS = [
  ['provider-side-nav-recommended-streams', SidebarFlags.RECOMMENDED_CHANNELS],
  ['provider-side-nav-similar-streamer-currently-watching', SidebarFlags.SIMILAR_CHANNELS],
  ['provider-sidenav-recommended-categories', SidebarFlags.RECOMMENDED_CATEGORIES],
  /* deprecated */
  ['RECENTLY_VISITED_SECTION', SidebarFlags.RECENTLY_WATCHED_CHANNELS],
  ['RECOMMENDED_SECTION', SidebarFlags.RECOMMENDED_CHANNELS],
  ['SIMILAR_SECTION', SidebarFlags.SIMILAR_CHANNELS],
];
const HIDEABLE_SECTION_FLAGS = [...new Set(SIDEBAR_SECTION_FLAGS.map(([, flag]) => flag))];

let offlineChannelObserverRemover = null;
let sidebarSectionObserverRemover = null;

function getSidebarSectionFlag(sectionId) {
  if (typeof sectionId !== 'string') {
    return null;
  }
  return SIDEBAR_SECTION_FLAGS.find(([prefix]) => sectionId.startsWith(prefix))?.[1] ?? null;
}

function toggleSidebarSectionClass(node) {
  const sidebarSection = twitch.getSidebarSection(node);
  if (sidebarSection == null) {
    return;
  }

  const flag = getSidebarSectionFlag(sidebarSection.sectionId ?? /* deprecated */ sidebarSection.type);
  if (flag == null) {
    return;
  }

  node.classList.toggle(styles.hide, !hasFlag(settings.get(SettingIds.SIDEBAR), flag));
}

class HideSidebarElementsModule {
  constructor() {
    settings.on(`changed.${SettingIds.SIDEBAR}`, () => {
      this.loadHideOfflineChannels();
      this.loadHideSidebarElements();
      this.toggleAutoExpandChannels();
      this.loadHideStories();
      this.loadHideLunaGames();
      this.loadHideWatchStreaks();
    });
    watcher.on('load', () => {
      this.loadHideOfflineChannels();
      this.loadHideSidebarElements();
      this.toggleAutoExpandChannels();
      this.loadHideStories();
      this.loadHideLunaGames();
      this.loadHideWatchStreaks();
    });
  }

  loadHideSidebarElements() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const enabled = HIDEABLE_SECTION_FLAGS.some((flag) => !hasFlag(setting, flag));

    if (enabled && sidebarSectionObserverRemover == null) {
      sidebarSectionObserverRemover = domObserver.on(sidebarSectionSelector, (node, isConnected) => {
        if (!isConnected) {
          return;
        }
        toggleSidebarSectionClass(node);
      });
    }

    if (!enabled && sidebarSectionObserverRemover != null) {
      sidebarSectionObserverRemover();
      sidebarSectionObserverRemover = null;
    }

    const sidebarSections = document.querySelectorAll(sidebarSectionSelector);
    for (const section of sidebarSections) {
      toggleSidebarSectionClass(section);
    }
  }

  loadHideStories() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const enabled = hasFlag(setting, SidebarFlags.STORIES);
    document.body.classList.toggle(styles.hideStories, !enabled);
  }

  loadHideWatchStreaks() {
    const enabled = hasFlag(settings.get(SettingIds.SIDEBAR), SidebarFlags.WATCH_STREAKS);
    document.body.classList.toggle(styles.hideWatchStreaks, !enabled);
  }

  loadHideLunaGames() {
    const setting = settings.get(SettingIds.SIDEBAR);
    const enabled = hasFlag(setting, SidebarFlags.LUNA_GAMES);
    document.body.classList.toggle(styles.hideLunaGames, !enabled);
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
