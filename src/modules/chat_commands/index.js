import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

export default loadModuleForPlatforms([
  PlatformTypes.TWITCH,
  async () => {
    // eslint-disable-next-line import/no-unresolved
    await import('./commands/*.js');
  },
]);
