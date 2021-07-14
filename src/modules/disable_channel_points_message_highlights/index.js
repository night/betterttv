import $ from 'jquery';
import {ChannelPointsFlags, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import watcher from '../../watcher.js';

class DisableChannelPointsMessageHighlightsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    $('.chat-scrollable-area__message-container').toggleClass(
      'bttv-disable-channel-points-message-highlights',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.MESSAGE_HIGHLIGHTS)
    );
  }
}

export default new DisableChannelPointsMessageHighlightsModule();
