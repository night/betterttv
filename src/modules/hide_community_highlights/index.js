import {ChatFlags, PlatformTypes, SettingIds} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

let removeCommunityHighlightsListener;

class HideCommunityHighlightsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, this.toggleCommunityHighlights);
    watcher.on('load', this.toggleCommunityHighlights);
  }

  toggleCommunityHighlights() {
    if (!hasFlag(settings.get(SettingIds.CHAT), ChatFlags.COMMUNITY_HIGHLIGHTS)) {
      if (removeCommunityHighlightsListener) return;

      removeCommunityHighlightsListener = domObserver.on('.community-highlight-stack__card', (node, isConnected) => {
        if (!isConnected) return;

        const communityHighlight = twitch.getCommunityHighlight();
        if (
          communityHighlight?.event?.type === 'poll' ||
          node.querySelector('button[data-test-selector="community-prediction-highlight-header__action-button"]') !=
            null
        ) {
          return;
        }

        node.classList.add('bttv-hide-community-highlights');
      });
      return;
    }

    if (!removeCommunityHighlightsListener) return;

    removeCommunityHighlightsListener();
    removeCommunityHighlightsListener = undefined;
    document.querySelector('.community-highlight-stack__card')?.classList.remove('bttv-hide-community-highlights');
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideCommunityHighlightsModule()]);
