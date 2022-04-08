import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchEmoteAutocomplete from './twitch/EmoteAutocomplete.jsx';
import YoutubeEmoteAutocomplete from './youtube/EmoteAutocomplete.jsx';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => new TwitchEmoteAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new YoutubeEmoteAutocomplete()]
);
