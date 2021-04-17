import SafeEventEmitter from './utils/safe-event-emitter.js';
import storage from './storage.js';

const settings = {};

class Settings extends SafeEventEmitter {
    constructor() {
        super();
    }

    add({id, name, description, defaultValue}) {
        if (id in settings) {
            throw new Error(`${id} is already a defined setting.`);
        }

        settings[id] = {
            id,
            name,
            description,
            defaultValue
        };

        this.emit('added', settings[id]);
    }

    getSettings() {
        return Object.values(settings)
            .map(setting => Object.assign({
                value: this.get(setting.id)
            }, setting));
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
        const rv = storage.set(id, value, undefined, false, true, temporary);
        if (emit) this.emit(`changed.${id}`, value);
        return rv;
    }
}

export default new Settings();
