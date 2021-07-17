import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import domObserver from '../../observers/dom.js';
import {ChatFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

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
        const $node = $(node);
        if ($node.find('.channel-poll__more-icon').length > 0) return;
        if ($node.find('button[data-test-selector="community-prediction-highlight-header__action-button"]').length > 0)
          return;
        $node.addClass('bttv-hide-community-highlights');
      });
      return;
    }

    if (!removeCommunityHighlightsListener) return;

    removeCommunityHighlightsListener();
    removeCommunityHighlightsListener = undefined;
    $('.community-highlight-stack__card').removeClass('bttv-hide-community-highlights');
  }
}

export default new HideCommunityHighlightsModule();
