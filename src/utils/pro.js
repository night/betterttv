import {SettingDefaultValues} from '../constants.js';
import settings from '../settings.js';

export function isUserPro(currentUser) {
  return currentUser != null && currentUser.pro === true;
}

export function getProSettingValue(currentUser, settingId) {
  if (!isUserPro(currentUser)) {
    return SettingDefaultValues[settingId];
  }

  return settings.get(settingId);
}
