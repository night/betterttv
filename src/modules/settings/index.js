import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import SettingsModule from './Settings.jsx';

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SettingsModule()]);
