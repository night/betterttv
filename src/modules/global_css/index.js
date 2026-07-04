import {PlatformTypes} from '@/constants';
import extension from '@/utils/extension';
import {loadModuleForPlatforms} from '@/utils/modules';
import {getPlatform} from '@/utils/window';

class GlobalCSSModule {
  constructor() {
    loadModuleForPlatforms(
      [PlatformTypes.TWITCH, () => import('./twitch')],
      [PlatformTypes.YOUTUBE, () => import('./youtube')]
    );
  }

  loadGlobalCSS() {
    if (getPlatform() === PlatformTypes.YOUTUBE) {
      document.body.classList.toggle('bttv-youtube', true);
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
      css.addEventListener('error', (err) => reject(err));
      document.body.appendChild(css);
    });
  }
}

export default new GlobalCSSModule();
