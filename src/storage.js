const cookies = require('cookies-js');
const SafeEventEmitter = require('./utils/safe-event-emitter');

// legacy setting parser
const parseSetting = function(value) {
    if (value === null) {
        return null;
    } else if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    } else if (value === '') {
        return '';
    } else if (isNaN(value) === false) {
        return parseFloat(value, 10);
    }

    return value;
};

class Storage extends SafeEventEmitter {
    constructor() {
        super();

        this._cache = {};
        this._prefix = 'bttv_';
        this._localStorageSupport = true;

        try {
            window.localStorage.setItem('bttv_test', 'it works!');
            window.localStorage.removeItem('bttv_test');
        } catch (e) {
            this._localStorageSupport = false;
        }

        this.legacyImport();
    }

    legacyImport() {
        if (this.get('importedV6') || !this._localStorageSupport) {
            return;
        }

        Object.keys(window.localStorage)
            .filter(id => id.startsWith('bttv_') || id === 'nicknames')
            .map(id => {
                let value = parseSetting(window.localStorage.getItem(id));

                if (id === 'nicknames') {
                    value = JSON.parse(value);
                }

                id = id.split('bttv_')[1] || id;

                return {
                    id,
                    value
                };
            })
            .forEach(setting => this.set(setting.id, setting.value));

        this.set('importedV6', true);
    }

    getStorage() {
        const storage = {};

        if (!this._localStorageSupport) {
            return storage;
        }

        Object.keys(window.localStorage)
            .filter(id => id.startsWith('bttv_'))
            .forEach(id => {
                storage[id] = this.get(id, null);
            });

        return storage;
    }

    get(id, prefix = this._prefix) {
        if (prefix) {
            id = prefix + id;
        }

        if (id in this._cache) {
            return this._cache[id];
        }

        try {
            return JSON.parse(this._localStorageSupport ? window.localStorage.getItem(id) : cookies.get(id));
        } catch (e) {
            return null;
        }
    }

    set(id, value, prefix = this._prefix, emit = true, cache = true) {
        let storageId = id;
        if (prefix) {
            storageId = prefix + id;
        }

        if (cache) {
            this._cache[storageId] = value;
        }

        if (emit) {
            this.emit(`changed.${id}`, value);
        }

        value = JSON.stringify(value);

        return this._localStorageSupport ? (
            window.localStorage.setItem(storageId, value)
        ) : (
            cookies.set(storageId, value, {expires: Infinity})
        );
    }
}

module.exports = new Storage();
