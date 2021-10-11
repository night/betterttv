import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import EmoteMenu from './EmoteMenu.jsx';

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new EmoteMenu()]);
