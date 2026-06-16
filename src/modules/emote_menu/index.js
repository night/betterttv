import {PlatformTypes} from '@/constants';
import TwitchEmoteMenu from '@/modules/emote_menu/twitch/EmoteMenu';
import YouTubeEmoteMenu from '@/modules/emote_menu/youtube/EmoteMenu';
import {loadModuleForPlatforms} from '@/utils/modules';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, async () => new TwitchEmoteMenu()],
  [PlatformTypes.YOUTUBE, async () => new YouTubeEmoteMenu()]
);
