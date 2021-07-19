import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';
import {SettingIds} from './constants.js';
import {deserializeLegacy, updateLegacySetting} from './utils/legacy-settings.js';

let settings = {};

class Settings extends SafeEventEmitter {
  constructor() {
    super();
    settings = storage.get('settings');

    if (settings != null && settings.version == null) {
      settings = null;
    }

    if (settings === null) {
      this.importLegacySettings();
    }
  }

  get(id) {
    return settings[id];
  }

  // eslint-disable-next-line no-unused-vars
  set(id, value, emit = true, temp = false) {
    const updatedSettings = {...settings, [id]: value, version: process.env.EXT_VER};
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
