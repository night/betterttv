import {PlatformTypes} from '@/constants';
import extension from '@/utils/extension';
import {loadModuleForPlatforms} from '@/utils/modules';
import {getPlatform} from '@/utils/window';

function waitForBody() {
  if (document.body != null) {
    return Promise.resolve(document.body);
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.body == null) {
        return;
      }
      observer.disconnect();
      resolve(document.body);
    });
    observer.observe(document.documentElement, {childList: true});
  });
}

class GlobalCSSModule {
  constructor() {
    loadModuleForPlatforms(
      [PlatformTypes.TWITCH, () => import('./twitch')],
      [PlatformTypes.YOUTUBE, () => import('./youtube')]
    );
  }

  loadGlobalCSS() {
    if (getPlatform() === PlatformTypes.YOUTUBE) {
      waitForBody().then((body) => body.classList.toggle('bttv-youtube', true));
    }

    const extensionCSSUrl = extension.url('betterttv.css', true);
    if (!extensionCSSUrl) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.setAttribute('href', extensionCSSUrl);
      css.setAttribute('type', 'text/css');
      css.setAttribute('rel', 'stylesheet');
      css.addEventListener('load', () => resolve());
      css.addEventListener('error', () => reject(new Error(`Failed to load global CSS from ${extensionCSSUrl}`)));
      // the body may not exist yet when we're injected early in page load
      waitForBody().then((body) => body.appendChild(css));
    });
  }
}

export default new GlobalCSSModule();
