import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';
import {SettingIds} from './constants.js';
import {deserializeLegacy, updateLegacySetting} from './utils/legacy-settings.js';

let settings = {};

class Settings extends SafeEventEmitter {
  constructor() {
    super();
    if (storage.get('settings') === null) {
      this.importLegacySettings();
      return;
    }
    settings = storage.get('settings');
  }

  get(id) {
    return settings[id];
  }

  // eslint-disable-next-line no-unused-vars
  set(id, value, emit = true, temp = false) {
    const updatedSettings = {...settings, [id]: value};
    storage.set('settings', updatedSettings);
    settings = updatedSettings;

    const rv = updateLegacySetting(id, value);
    if (emit) this.emit(`changed.${id}`, value);
    return rv;
  }

  importLegacySettings() {
    const updatedSettings = {};
    for (const id of Object.values(SettingIds)) {
      const [settingId, serializedValue] = deserializeLegacy(id);
      updatedSettings[settingId] = serializedValue;
    }

    storage.set('settings', updatedSettings);
    settings = updatedSettings;
  }
}

export default new Settings();
