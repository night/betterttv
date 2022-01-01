import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchSettingsModule from './twitch/Settings.jsx';
import YoutubeSettingModule from './youtube/Settings.jsx';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, async () => new TwitchSettingsModule()],
  [PlatformTypes.YOUTUBE, async () => new YoutubeSettingModule()]
);
