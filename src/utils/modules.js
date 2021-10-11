/* eslint-disable import/prefer-default-export */

import {getPlatform} from './window.js';

const currentPlatform = getPlatform();

export function loadModuleForPlatforms(...platformConfigurations) {
  for (const [platformType, callback] of platformConfigurations) {
    if (platformType === currentPlatform) {
      return callback();
    }
  }

  return null;
}
