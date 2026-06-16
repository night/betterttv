import {PlatformTypes} from '@/constants';
import TwitchSettingsModule from '@/modules/settings/twitch/Settings';
import YoutubeSettingModule from '@/modules/settings/youtube/Settings';
import {loadModuleForPlatforms} from '@/utils/modules';

const settings = {
  openSettings: () => {},
};

loadModuleForPlatforms(
  [PlatformTypes.TWITCH, async () => new TwitchSettingsModule()],
  [PlatformTypes.YOUTUBE, async () => new YoutubeSettingModule()]
).then((resolvedSettings) => {
  settings.openSettings = resolvedSettings.openSettings;
});

export default settings;
