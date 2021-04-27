import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';

const settings = {};

class Settings extends SafeEventEmitter {
  add({id, name, type = 0, options = {}, category, description, defaultValue}) {
    if (id in settings) {
      throw new Error(`${id} is already a defined setting.`);
    }

    settings[id] = {
      id,
      name,
      type,
      options,
      category,
      description,
      defaultValue,
    };

    this.emit('added', settings[id]);
  }

  getSettings() {
    return Object.values(settings).map((setting) => ({
      value: this.get(setting.id),
      ...setting,
    }));
  }

  get(id) {
    const value = storage.get(id);
    if (value !== null) {
      return value;
    }

    const setting = settings[id];
    return setting ? setting.defaultValue : null;
  }

  set(id, value, emit = true, temporary = false) {
    const prev = this.get(id);
    const rv = storage.set(id, value, undefined, false, true, temporary);
    if (emit) this.emit(`changed.${id}`, value, prev);
    return rv;
  }
}

export default new Settings();
