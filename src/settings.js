import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';
import {SettingIds, FlagSettings, DefaultValues, ChatFlags} from './constants.js';
import {deserializeLegacy} from './utils/legacy-settings.js';
import {getChangedFlags, setFlag} from './utils/flags.js';

let settings = {};

class Settings extends SafeEventEmitter {
  constructor() {
    super();
    settings = storage.get('settings');

    if (settings != null && settings.version == null) {
      settings = null;
    }

    const storedVersion = settings?.version;

    if (settings === null) {
      this.importLegacySettings();
    }

    this.upgradeFlags(storedVersion);
  }

  get(id) {
    const value = settings[id];

    // we store flags as a tuple of [value, changedBits]
    if (FlagSettings.includes(id)) {
      return value[0];
    }

    return value;
  }

  // eslint-disable-next-line no-unused-vars
  set(id, value, emit = true, temp = false) {
    let storageValue = value;

    // we store flags as a tuple of [value, changedBits]
    if (FlagSettings.includes(id) && !Array.isArray(storageValue)) {
      const [oldFlags, oldChangedBits] = settings[id];
      storageValue = [storageValue, oldChangedBits | getChangedFlags(oldFlags, storageValue)];
    }

    const updatedSettings = {...settings, [id]: storageValue, version: process.env.EXT_VER};
    storage.set('settings', updatedSettings);
    settings = updatedSettings;

    if (emit) this.emit(`changed.${id}`, value);
    return value;
  }

  upgradeFlags(version) {
    for (const flagSettingId of FlagSettings) {
      const defaultValue = DefaultValues[flagSettingId];
      const defaultFlags = defaultValue[0];

      let inferredDefaultFlags = defaultFlags;
      // temporarily handle changed flags predating the upgrade system
      if (flagSettingId === SettingIds.CHAT) {
        inferredDefaultFlags = setFlag(inferredDefaultFlags, ChatFlags.CHAT_MESSAGE_HISTORY, false);
      }

      // load defaults if somehow the data is null-y
      const oldValue = settings[flagSettingId];
      if (oldValue == null) {
        this.set(flagSettingId, defaultValue);
      }

      // upgrade flags stored without changedBits
      else if (typeof oldValue === 'number') {
        this.set(flagSettingId, [oldValue, getChangedFlags(inferredDefaultFlags, oldValue)]);
      }

      let [oldFlags, oldChangedBits] = settings[flagSettingId];

      // fix flags which were improperly defaulted in 7.4.11
      if (
        version === '7.4.11' &&
        ((oldFlags === 0 && oldChangedBits === defaultFlags) ||
          (flagSettingId === SettingIds.CHAT &&
            oldFlags === ChatFlags.CHAT_MESSAGE_HISTORY &&
            (oldChangedBits === defaultFlags || oldChangedBits === inferredDefaultFlags)))
      ) {
        oldFlags = defaultFlags;
        oldChangedBits = 0;
        this.set(flagSettingId, defaultValue);
      }

      // upgrade flags where default bits changed
      const flagsToAdd = setFlag(defaultFlags, oldChangedBits, false);
      if (flagsToAdd > 0) {
        this.set(flagSettingId, setFlag(oldFlags, flagsToAdd, true));
      }
    }
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
