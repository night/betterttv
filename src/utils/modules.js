/* eslint-disable import/prefer-default-export */

import {getPlatform} from './window.js';

const currentPlatform = getPlatform();

export async function loadModuleForPlatforms(...platformConfigurations) {
  for await (const [platformType, callback] of platformConfigurations) {
    if (platformType === currentPlatform) {
      return callback();
    }
  }

  return null;
}
