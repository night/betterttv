var cookies = require('cookies-js');
var debug = require('./helpers/debug');

function Storage() {
    this._localStorageSupport = true;

    if (!window.localStorage) {
        debug.log('window.localStorage not detected. Defaulting to cookies.');
        this._localStorageSupport = false;
    } else {
        try {
            window.localStorage.setItem('bttv_test', 'it works!');
            window.localStorage.removeItem('bttv_test');
        } catch(e) {
            debug.log('window.localStorage detected, but unable to save. Defaulting to cookies.');
            this._localStorageSupport = false;
        }
    }
}

Storage.prototype.exists = function(item) {
    return (this.get(item) ? true : false);
};

Storage.prototype.get = function(item) {
    return this._localStorageSupport ? window.localStorage.getItem(item) : cookies.get(item);
};

Storage.prototype.getArray = function(item) {
    if (!this.exists(item)) this.putArray(item, []);
    return JSON.parse(this.get(item));
};

Storage.prototype.getObject = function(item) {
    if (!this.exists(item)) this.putObject(item, {});
    return JSON.parse(this.get(item));
};

Storage.prototype.put = function(item, value) {
    this._localStorageSupport ? window.localStorage.setItem(item, value) : cookies.set(item, value, { expires: Infinity });
};

Storage.prototype.pushArray = function(item, value) {
    var i = this.getArray(item);
    i.push(value);
    this.putArray(item, i);
};

Storage.prototype.pushObject = function(item, key, value) {
    var i = this.getObject(item);
    i[key] = value;
    this.putObject(item, i);
};

Storage.prototype.putArray = function(item, value) {
    this.put(item, JSON.stringify(value));
};

Storage.prototype.putObject = function(item, value) {
    this.put(item, JSON.stringify(value));
};

Storage.prototype.spliceArray = function(item, value) {
    var i = this.getArray(item);
    if (i.indexOf(value) !== -1) i.splice(i.indexOf(value), 1);
    this.putArray(item, i);
};

Storage.prototype.spliceObject = function(item, key) {
    var i = this.getObject(item);
    delete i[key];
    this.putObject(item, i);
};

module.exports = Storage;
