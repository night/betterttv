import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
// import TwitchEmoteAutocomplete from './twitch/EmoteAutocomplete.jsx';
import CommandAutocomplete from './youtube/CommandAutocomplete.jsx';

export default loadModuleForPlatforms(
  // [PlatformTypes.TWITCH, () => new TwitchEmoteAutocomplete()],
  [PlatformTypes.YOUTUBE, () => new CommandAutocomplete()]
);
