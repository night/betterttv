const EventEmitter = require('events').EventEmitter;
const storage = require('./storage');

class Settings extends EventEmitter {
    constructor() {
        super();

        this._settings = {};
    }

    add({id, name, description, defaultValue}) {
        if (id in this._settings) {
            throw new Error(`${id} is already a defined setting.`);
        }

        this._settings[id] = {
            id,
            name,
            description,
            defaultValue
        };

        this.emit('added', this._settings[id]);
    }

    getSettings() {
        return this._settings;
    }

    get(id) {
        const value = storage.get(id);
        if (value !== null) {
            return value;
        }

        const setting = this._settings[id];
        return setting ? setting.defaultValue : null;
    }

    set(id, value) {
        const rv = storage.set(id, value, undefined, false);
        this.emit(`changed.${id}`, value);
        return rv;
    }
}

module.exports = new Settings();
