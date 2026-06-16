import debug from './debug';
import Sentry from './sentry';
import {getPlatform} from './window';

const currentPlatform = getPlatform();

export function loadModuleForPlatforms(...platformConfigurations) {
  for (const [platformType, callback] of platformConfigurations) {
    if (platformType === currentPlatform) {
      return callback();
    }
  }

  return null;
}

// Imports every module matched by an `import.meta.glob` call, isolating failures so one
// broken module cannot prevent the others from loading (replaces the webpack-import-glob loader).
export async function importAll(modules) {
  for (const [modulePath, load] of Object.entries(modules)) {
    try {
      await load();
    } catch (e) {
      Sentry.captureException(e);
      debug.error(`Failed to import ${modulePath}`, e.stack);
    }
  }
}
