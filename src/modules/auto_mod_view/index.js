import {PlatformTypes, SettingIds} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

const MOD_VIEW_BUTTON_SELECTOR = '[data-test-selector="mod-view-link"]';
const noReload = window.location.search.includes('no-reload');
const referringPath = document.referrer ? new URL(document.referrer).pathname : null;

let modViewButtonListener;

class AutoModViewModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_MOD_VIEW}`, () => this.load());
  }

  load() {
    const autoModView = settings.get(SettingIds.AUTO_MOD_VIEW);

    if (!autoModView && modViewButtonListener != null) {
      modViewButtonListener();
      modViewButtonListener = undefined;
    } else if (autoModView && modViewButtonListener == null) {
      modViewButtonListener = domObserver.on(MOD_VIEW_BUTTON_SELECTOR, (node, isConnected) => {
        if (
          !isConnected ||
          noReload ||
          referringPath.startsWith('/moderator/') ||
          window.location.pathname.startsWith('/moderator/')
        ) {
          return;
        }
        node.click();
      });
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoModViewModule()]);
