import {create} from 'zustand';

const FLASH_DURATION = 1400;

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
