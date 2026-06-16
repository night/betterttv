import {ChannelPointsFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

class DisableChannelPointsMessageHighlightsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    document.body.classList.toggle(
      'bttv-disable-channel-points-message-highlights',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.MESSAGE_HIGHLIGHTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableChannelPointsMessageHighlightsModule()]);
