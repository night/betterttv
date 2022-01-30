import cookies from 'cookies-js';

class Storage {
  constructor() {
    this._cache = {};
    this._prefix = 'bttv_';
    this._localStorageSupport = true;

    try {
      window.localStorage.setItem('bttv_test', 'it works!');
      window.localStorage.removeItem('bttv_test');
    } catch (e) {
      this._localStorageSupport = false;
    }
  }

  getStorage() {
    const storage = {};

    if (!this._localStorageSupport) {
      return storage;
    }

    Object.keys(window.localStorage)
      .filter((id) => id.startsWith('bttv_'))
      .forEach((id) => {
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

  set(id, value, prefix = this._prefix) {
    let storageId = id;
    if (prefix) {
      storageId = prefix + id;
    }

    this._cache[storageId] = value;

    value = JSON.stringify(value);

    if (this._localStorageSupport) {
      window.localStorage.setItem(storageId, value);
    } else {
      cookies.set(storageId, value, {expires: Infinity});
    }
  }
}

export default new Storage();
