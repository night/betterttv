import {PlatformTypes} from '@/constants';
import TwitchCommandAutocomplete from '@/modules/command_autocomplete/twitch/Autocomplete';
import YoutubeCommandAutocomplete from '@/modules/command_autocomplete/youtube/Autocomplete';
import {loadModuleForPlatforms} from '@/utils/modules';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => new TwitchCommandAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new YoutubeCommandAutocomplete()]
);
