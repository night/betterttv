import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchCommandAutocomplete from './twitch/Autocomplete.jsx';
import YoutubeCommandAutocomplete from './youtube/Autocomplete.jsx';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => new TwitchCommandAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new YoutubeCommandAutocomplete()]
);
