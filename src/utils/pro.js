import {SettingDefaultValues} from '@/constants';
import settings from '@/settings';
import AuthStore from '@/stores/auth';

export function isUserPro(currentUser) {
  return currentUser != null && currentUser.pro === true;
}

export function getProSettingValue(settingId, defaultValue) {
  const {user: currentUser} = AuthStore.getState();

  if (!isUserPro(currentUser)) {
    return defaultValue ?? SettingDefaultValues[settingId];
  }

  return settings.get(settingId);
}
