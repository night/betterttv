import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import ChatContextMenu from './twitch/ContextMenu.jsx';

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatContextMenu()]);
