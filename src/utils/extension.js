import {EXT_VER} from '../constants.js';

const browser = window.chrome || window.browser;

let EXTENSION_SCHEME;
let EXTENSION_ID;
let EXTENSION_RESOURCES_ID;
if (window.navigator.userAgent.includes('Firefox/')) {
  EXTENSION_SCHEME = 'moz-extension://';
  EXTENSION_ID = 'firefox@betterttv.net';
  EXTENSION_RESOURCES_ID = browser?.runtime?.id || undefined;
} else if (window.navigator.userAgent.includes('Edge/') || window.navigator.userAgent.includes('Edg/')) {
  EXTENSION_SCHEME = 'chrome-extension://';
  EXTENSION_ID = 'icllegkipkooaicfmdfaloehobmglglb';
  EXTENSION_RESOURCES_ID = EXTENSION_ID;
} else if (window.navigator.userAgent.includes('Chrome/')) {
  EXTENSION_SCHEME = 'chrome-extension://';
  EXTENSION_ID = 'ajopnjidmegmdimjlfnijceegpefgped';
  EXTENSION_RESOURCES_ID = EXTENSION_ID;
}

let currentScriptSrc;

export default {
  getExtensionId() {
    if (currentScriptSrc) {
      return null;
    }

    return EXTENSION_ID;
  },
  setCurrentScript(newCurrentScript) {
    currentScriptSrc = newCurrentScript?.src;
  },
  url(path, breakCache = false) {
    if ((EXTENSION_SCHEME == null || EXTENSION_RESOURCES_ID == null) && !currentScriptSrc) {
      return null;
    }

    const url = new URL(path, currentScriptSrc || `${EXTENSION_SCHEME}${EXTENSION_RESOURCES_ID}/betterttv.js`);
    return `${url.toString()}${breakCache ? `?v=${EXT_VER}` : ''}`;
  },
};
