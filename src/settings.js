import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';
import {SettingIds, FlagSettings, SettingDefaultValues, ChatFlags} from './constants.js';
import {getChangedFlags, setFlag} from './utils/flags.js';

export const SETTINGS_STORAGE_KEY = 'settings';
let settings = {};

class TempValue {
  constructor(value, storedValue) {
    this.currentValue = value;
    // if storedValue is already a TempValue, retrieve its storedValue
    this.storedValue = storedValue instanceof TempValue ? storedValue.storedValue : storedValue;
  }
}

class Settings extends SafeEventEmitter {
  constructor() {
    super();

    const defaultSettings = {...SettingDefaultValues};
    const oldSettings = storage.get(SETTINGS_STORAGE_KEY);
    settings = {...defaultSettings, ...oldSettings};

    if (oldSettings == null || (oldSettings != null && oldSettings.version == null)) {
      settings = {...settings, version: process.env.EXT_VER};
      storage.set(SETTINGS_STORAGE_KEY, settings);
    }

    this.upgradeFlags(settings.version);
  }

  get(id) {
    const value = settings[id];

    // we store flags as a tuple of [value, changedBits]
    if (FlagSettings.includes(id)) {
      return value[0];
    }

    // temp values only return the current value during page sessions
    if (value instanceof TempValue) {
      return value.currentValue;
    }

    return value;
  }

  set(id, value, temporary = false) {
    let storageValue = value;

    // we store flags as a tuple of [value, changedBits]
    if (FlagSettings.includes(id) && !Array.isArray(storageValue)) {
      const [oldFlags, oldChangedBits] = settings[id];
      storageValue = [storageValue, oldChangedBits | getChangedFlags(oldFlags, storageValue)];
    }

    // temp values return the new value during page sessions and persist the prior stored value
    if (temporary === true) {
      storageValue = new TempValue(storageValue, settings[id]);
    }

    const updatedSettings = {...settings, [id]: storageValue, version: process.env.EXT_VER};
    settings = updatedSettings;

    const storageSettings = {...updatedSettings};
    for (const key of Object.keys(storageSettings)) {
      const currentValue = storageSettings[key];
      if (currentValue instanceof TempValue) {
        storageSettings[key] = currentValue.storedValue;
      }
    }
    storage.set(SETTINGS_STORAGE_KEY, storageSettings);

    this.emit(`changed.${id}`, value, temporary);

    return value;
  }

  upgradeFlags(version) {
    for (const flagSettingId of FlagSettings) {
      const defaultValue = SettingDefaultValues[flagSettingId];
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
}

export default new Settings();
