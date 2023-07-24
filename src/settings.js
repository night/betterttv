import semver from 'semver';
import {SettingIds, FlagSettings, SettingDefaultValues, ChatFlags, EmoteMenuTypes, SidebarFlags} from './constants.js';
import storage from './storage.js';
import {getChangedFlags, hasFlag, setFlag} from './utils/flags.js';
import SafeEventEmitter from './utils/safe-event-emitter.js';

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

    this.upgrade(settings.version);
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
    if (storageValue == null) {
      delete updatedSettings[id];
    }

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

  upgrade(version) {
    if (semver.lt(version, '7.5.5')) {
      // now storing emote menu as an enum rather than a boolean
      const oldEmoteMenuValue = this.get(SettingIds.LEGACY_EMOTE_MENU);
      if (oldEmoteMenuValue != null) {
        const emoteMenuValue = oldEmoteMenuValue ? EmoteMenuTypes.LEGACY_ENABLED : EmoteMenuTypes.NONE;
        this.set(SettingIds.EMOTE_MENU, emoteMenuValue);
        this.set(SettingIds.LEGACY_EMOTE_MENU, null);
      }

      // upgrade sidebar flags: split featured channels into one option per section
      const oldSidebarValue = this.get(SettingIds.SIDEBAR);
      if (oldSidebarValue != null && !hasFlag(oldSidebarValue, SidebarFlags.RECOMMENDED_CHANNELS)) {
        const value = setFlag(oldSidebarValue, SidebarFlags.SIMILAR_CHANNELS, false);
        this.set(SettingIds.SIDEBAR, value);
      }
    }

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

      // upgrade flags where default bits changed
      const flagsToAdd = setFlag(defaultFlags, oldChangedBits, false);
      if (flagsToAdd > 0) {
        this.set(flagSettingId, setFlag(oldFlags, flagsToAdd, true));
      }
    }
  }
}

export default new Settings();
