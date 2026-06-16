import {PlatformTypes} from '@/constants';
import TwitchEmoteAutocomplete from '@/modules/emote_autocomplete/twitch/EmoteAutocomplete';
import YoutubeEmoteAutocomplete from '@/modules/emote_autocomplete/youtube/EmoteAutocomplete';
import {loadModuleForPlatforms} from '@/utils/modules';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => new TwitchEmoteAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new YoutubeEmoteAutocomplete()]
);
