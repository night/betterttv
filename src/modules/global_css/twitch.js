import {SettingIds} from '@/constants';
import settings from '@/settings';
import twitch from '@/utils/twitch';

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

function matchSystemTheme() {
  // Will only match the system theme if the browser is also configured to match the system theme
  if (!settings.get(SettingIds.AUTO_THEME_MODE)) return;
  if (!connectStore) return;

  const twitchIsDarkMode = connectStore.getState().ui.theme === TwitchThemes.DARK;
  const systemIsDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (systemIsDarkMode !== twitchIsDarkMode) {
    setTwitchTheme(!twitchIsDarkMode);
  }
}

settings.on(`changed.${SettingIds.AUTO_THEME_MODE}`, (value, temporary) => {
  if (temporary || !value) return;
  matchSystemTheme();
});

const CONNECT_STORE_POLL_INTERVAL = 100;
const CONNECT_STORE_TIMEOUT = 30000;

function syncWithTwitchTheme(store) {
  connectStore = store;

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    matchSystemTheme();
  });

  matchSystemTheme();

  function syncDarkenedMode() {
    const uiState = connectStore.getState().ui;
    const isDarkMode = uiState.theme === TwitchThemes.DARK || uiState.theatreModeEnabled === true;
    if (settings.get(SettingIds.DARKENED_MODE) === isDarkMode) {
      return;
    }

    settings.set(SettingIds.DARKENED_MODE, isDarkMode, true);
  }

  // we may attach after twitch already set its theme, so sync once up front
  syncDarkenedMode();
  connectStore.subscribe(syncDarkenedMode);
}

// we can load before twitch's react root mounts, so keep looking for the store until it does
(() => {
  const startTime = Date.now();

  function findConnectStore() {
    const store = twitch.getConnectStore();
    if (store != null) {
      syncWithTwitchTheme(store);
      return;
    }

    if (Date.now() - startTime < CONNECT_STORE_TIMEOUT) {
      setTimeout(findConnectStore, CONNECT_STORE_POLL_INTERVAL);
    }
  }

  findConnectStore();
})();
