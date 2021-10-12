import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchEmoteMenu from './twitch/EmoteMenu.jsx';
import YouTubeEmoteMenu from './youtube/EmoteMenu.jsx';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, async () => new TwitchEmoteMenu()],
  [PlatformTypes.YOUTUBE, async () => new YouTubeEmoteMenu()]
);
