import {EXT_VER} from '../constants.js';
import debug from './debug.js';

const browser = window.chrome || window.browser;

const Extensions = {
  CHROME: {
    scheme: 'chrome-extension://',
    id: 'ajopnjidmegmdimjlfnijceegpefgped',
    resourcesId: 'ajopnjidmegmdimjlfnijceegpefgped',
  },
  EDGE: {
    scheme: 'chrome-extension://',
    id: 'icllegkipkooaicfmdfaloehobmglglb',
    resourcesId: 'icllegkipkooaicfmdfaloehobmglglb',
  },
  FIREFOX: {
    scheme: 'moz-extension://',
    id: 'firefox@betterttv.net',
    resourcesId: browser?.runtime?.id || undefined,
  },
};

async function getResourceScriptUrl(scheme, id) {
  if (!id) {
    return null;
  }

  try {
    const resourceScriptUrl = `${scheme}${id}/betterttv.js`;
    await fetch(resourceScriptUrl);
    return resourceScriptUrl;
  } catch (_) {
    return null;
  }
}

let currentScriptSrc;
let currentExtension;

export default {
  async setCurrentScript(newCurrentScript) {
    if (newCurrentScript?.src != null) {
      currentScriptSrc = newCurrentScript?.src;

      if (currentScriptSrc.startsWith(Extensions.FIREFOX.scheme)) {
        currentExtension = Extensions.FIREFOX;
      }

      debug.log('Found script source', currentScriptSrc, currentExtension);
      return;
    }

    // script was injected directly, which means an extension loaded it
    // due to MV3 changes, we can't get the script src
    // so i guess let's just try them all
    for await (const extension of Object.values(Extensions)) {
      const resourceScriptUrl = await getResourceScriptUrl(extension.scheme, extension.resourcesId);
      if (resourceScriptUrl) {
        currentScriptSrc = resourceScriptUrl;
        currentExtension = extension;
        debug.log('Found native extension', currentScriptSrc, currentExtension);
        return;
      }
    }

    debug.error('Failed to find native extension or script source');
  },
  getExtension() {
    return currentExtension;
  },
  url(path, breakCache = false) {
    if (!currentScriptSrc) {
      return null;
    }

    const url = new URL(path, currentScriptSrc);
    return `${url.toString()}${breakCache ? `?v=${EXT_VER}` : ''}`;
  },
};
