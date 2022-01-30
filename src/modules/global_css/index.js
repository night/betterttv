import $ from 'jquery';
import cdn from '../../utils/cdn.js';
import extension from '../../utils/extension.js';
import watcher from '../../watcher.js';
import {PlatformTypes} from '../../constants.js';
import {getPlatform} from '../../utils/window.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class GlobalCSSModule {
  constructor() {
    watcher.on('load', () => this.branding());
    this.branding();

    loadModuleForPlatforms(
      [PlatformTypes.TWITCH, () => import('./twitch.js')],
      [PlatformTypes.YOUTUBE, () => import('./youtube.js')]
    );
  }

  loadGlobalCSS() {
    // TODO: this is a crazy hack to enable youtube-specific rsuite overrides
    // we should find a better way
    if (getPlatform() === PlatformTypes.YOUTUBE) {
      $('body').toggleClass('bttv-youtube', true);
    }

    return new Promise((resolve) => {
      const css = document.createElement('link');
      css.setAttribute('href', extension.url('betterttv.css', true));
      css.setAttribute('type', 'text/css');
      css.setAttribute('rel', 'stylesheet');
      css.addEventListener('load', () => resolve());
      $('body').append(css);
    });
  }

  branding() {
    if ($('.bttv-logo').length) return;

    const $watermark = $('<img />');
    $watermark.attr('class', 'bttv-logo');
    $watermark.attr('src', cdn.url('assets/logos/logo_icon.png'));
    $watermark.css({
      'z-index': 9000,
      left: '-74px',
      top: '-18px',
      width: '12px',
      height: 'auto',
      position: 'relative',
    });
    $('.top-nav__home-link').append($watermark);
  }
}

export default new GlobalCSSModule();
