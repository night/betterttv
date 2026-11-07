import {SettingIds} from '@/constants';
import settings from '@/settings';
import twitch from '@/utils/twitch';

const TWITCH_THEME_CHANGED_DISPATCH_TYPE = 'core.ui.THEME_CHANGED';
const TWITCH_THEME_STORAGE_KEY = 'twilight.theme';
const TwitchThemes = {
  LIGHT: 0,
  DARK: 1,
};
const CONNECT_STORE_POLL_INTERVAL = 100;
const CONNECT_STORE_TIMEOUT = 30000;

const systemDarkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

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

function matchSystemTheme() {
  // Will only match the system theme if the browser is also configured to match the system theme
  if (!settings.get(SettingIds.AUTO_THEME_MODE)) return;
  if (!connectStore) return;

  const twitchIsDarkMode = connectStore.getState().ui.theme === TwitchThemes.DARK;
  if (systemDarkModeQuery.matches !== twitchIsDarkMode) {
    setTwitchTheme(!twitchIsDarkMode);
  }
}

function syncDarkenedModeFromTwitch() {
  const uiState = connectStore.getState().ui;
  const isDarkMode = uiState.theme === TwitchThemes.DARK || uiState.theatreModeEnabled === true;
  if (settings.get(SettingIds.DARKENED_MODE) === isDarkMode) return;

  settings.set(SettingIds.DARKENED_MODE, isDarkMode, true);
}

function attachConnectStore(store) {
  connectStore = store;
  matchSystemTheme();
  // we may attach after twitch already set its theme, so sync once up front
  syncDarkenedModeFromTwitch();
  connectStore.subscribe(syncDarkenedModeFromTwitch);
}

// we can load before twitch's react root mounts, so keep looking for the store until it does
function findConnectStore(startTime = Date.now()) {
  const store = twitch.getConnectStore();
  if (store != null) {
    attachConnectStore(store);
    return;
  }

  if (Date.now() - startTime < CONNECT_STORE_TIMEOUT) {
    setTimeout(() => findConnectStore(startTime), CONNECT_STORE_POLL_INTERVAL);
  }
}

settings.on(`changed.${SettingIds.DARKENED_MODE}`, (value, temporary) => {
  if (temporary) return;
  setTwitchTheme(value);
});

settings.on(`changed.${SettingIds.AUTO_THEME_MODE}`, (value, temporary) => {
  if (temporary || !value) return;
  matchSystemTheme();
});

systemDarkModeQuery.addEventListener('change', matchSystemTheme);

findConnectStore();
