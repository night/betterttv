const cookies = require('cookies-js');
const debug = require('./utils/debug');
const EventEmitter = require('events').EventEmitter;

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

class Storage extends EventEmitter {
    constructor() {
        super();

        this._cache = {};
        this._prefix = 'bttv_';
        this._localStorageSupport = true;

        try {
            window.localStorage.setItem('bttv_test', 'it works!');
            window.localStorage.removeItem('bttv_test');
        } catch (e) {
            debug.log('window.localStorage not available. Defaulting to cookies.');
            this._localStorageSupport = false;
        }

        this.legacyImport();
    }

    legacyImport() {
        if (this.get('importedV6') || !this._localStorageSupport) {
            return;
        }

        Object.keys(window.localStorage)
            .filter(name => name.startsWith('bttv_') || name === 'nicknames')
            .map(name => {
                let value = parseSetting(window.localStorage.getItem(name));

                if (name === 'nicknames') {
                    value = JSON.parse(value);
                }

                name = name.split('bttv_')[1] || name;

                return {
                    name,
                    value
                };
            })
            .forEach(setting => this.set(setting.name, setting.value));

        this.set('importedV6', true);
    }

    get(name, prefix = this._prefix) {
        if (prefix) {
            name = prefix + name;
        }

        if (name in this._cache) {
            return this._cache[name];
        }

        return JSON.parse(this._localStorageSupport ? window.localStorage.getItem(name) : cookies.get(name));
    }

    set(name, value, prefix = this._prefix) {
        this.emit(`storage.${name}`, value);

        if (prefix) {
            name = prefix + name;
        }

        this._cache[name] = value;

        value = JSON.stringify(value);

        return this._localStorageSupport ? window.localStorage.setItem(name, value) : cookies.set(name, value, { expires: Infinity });
    }
}

module.exports = new Storage();
