import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import twitch from '../../utils/twitch.js';

const TWITCH_THEME_CHANGED_DISPATCH_TYPE = 'core.ui.THEME_CHANGED';
const TWITCH_THEME_STORAGE_KEY = 'twilight.theme';
const TwitchThemes = {
  LIGHT: 0,
  DARK: 1,
};

let connectStore;

function setTwitchTheme(value) {
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

settings.on(`changed.${SettingIds.DARKENED_MODE}`, (value, temporary) => {
  if (temporary) return;
  setTwitchTheme(value);
});

(() => {
  connectStore = twitch.getConnectStore();
  if (!connectStore) return;

  connectStore.subscribe(() => {
    const isDarkMode = connectStore.getState().ui.theme === TwitchThemes.DARK;
    if (settings.get(SettingIds.DARKENED_MODE) !== isDarkMode) {
      settings.set(SettingIds.DARKENED_MODE, isDarkMode, true);
    }
  });
})();
