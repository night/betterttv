import {create} from 'zustand';

// matches the flash in SettingsModal.module.css
const FLASH_DURATION = 1400;

// The setting a search jumped to, by name. Its row or group scrolls to itself and flashes while it's
// here, so it doesn't matter that the page it's on may not have rendered yet.
const useSettingFlashStore = create(() => ({settingName: null}));

let clearTimeoutId = null;

export function flashSetting(settingName) {
  clearTimeout(clearTimeoutId);
  useSettingFlashStore.setState({settingName});
  clearTimeoutId = setTimeout(() => useSettingFlashStore.setState({settingName: null}), FLASH_DURATION);
}

export function useSettingFlash(name) {
  return useSettingFlashStore((state) => name != null && state.settingName === name);
}
