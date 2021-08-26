import $ from 'jquery';
import cdn from '../../utils/cdn.js';
import extension from '../../utils/extension.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {SettingIds} from '../../constants.js';

const TWITCH_THEME_CHANGED_DISPATCH_TYPE = 'core.ui.THEME_CHANGED';
const TWITCH_THEME_STORAGE_KEY = 'twilight.theme';
const TwitchThemes = {
  LIGHT: 0,
  DARK: 1,
};

let connectStore;

class GlobalCSSModule {
  constructor() {
    watcher.on('load', () => this.branding());
    this.branding();
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, (value) => this.setTwitchTheme(value));

    this.loadTwitchThemeObserver();
  }

  setTwitchTheme(value) {
    if (!connectStore) return;

    const theme = value === true ? TwitchThemes.DARK : TwitchThemes.LIGHT;
    try {
      localStorage.setItem(TWITCH_THEME_STORAGE_KEY, JSON.stringify(theme));
    } catch (_) {}
    connectStore.dispatch({
      type: TWITCH_THEME_CHANGED_DISPATCH_TYPE,
      theme,
    });
  }

  loadTwitchThemeObserver() {
    connectStore = twitch.getConnectStore();
    if (!connectStore) return;

    connectStore.subscribe(() => {
      const isDarkMode = connectStore.getState().ui.theme === TwitchThemes.DARK;
      if (settings.get(SettingIds.DARKENED_MODE) !== isDarkMode) {
        settings.set('darkenedMode', isDarkMode, false, true);
      }
    });
  }

  loadGlobalCSS() {
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
