import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchEmoteAutocomplete from './twitch/EmoteAutcomplete.jsx';
import YoutubeEmoteAutocomplete from './youtube/EmoteAutcomplete.jsx';

export default loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => new TwitchEmoteAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new YoutubeEmoteAutocomplete()]
);
