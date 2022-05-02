import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class Moments {
  constructor() {
    this.loadAutoClaimMoments();
  }

  loadAutoClaimMoments() {}
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new Moments()]);
