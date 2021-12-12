import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import TwitchEmoteAutocomplete from './twitch/TwitchEmoteAutocomplete.jsx';

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new TwitchEmoteAutocomplete()]);
