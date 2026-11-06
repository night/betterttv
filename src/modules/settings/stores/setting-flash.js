import {create} from 'zustand';

// matches the flash in SettingsModal.module.css
const FLASH_DURATION = 1400;

// The setting a search jumped to, by name, so a row or group can flash on a page that's yet to render
const useSettingFlashStore = create(() => ({settingName: null}));

let timeout = null;

export function flashSetting(settingName) {
  clearTimeout(timeout);
  useSettingFlashStore.setState({settingName});
  timeout = setTimeout(() => useSettingFlashStore.setState({settingName: null}), FLASH_DURATION);
}

export function useSettingFlash(name) {
  return useSettingFlashStore((state) => name != null && state.settingName === name);
}
