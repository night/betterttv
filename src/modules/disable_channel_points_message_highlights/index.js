import $ from 'jquery';
import {ChannelPointsFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

class DisableChannelPointsMessageHighlightsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    $('body').toggleClass(
      'bttv-disable-channel-points-message-highlights',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.MESSAGE_HIGHLIGHTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableChannelPointsMessageHighlightsModule()]);
