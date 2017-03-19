const storage = require('../../storage');

let nicknames;

class ChatNicknamesModule {
    constructor() {
        nicknames = storage.get('nicknames') || {};
    }

    set(name) {
        let nickname = prompt(`Enter the new nickname for ${name} (Leave blank to reset)`);
        if (nickname === null) return;

        nickname = nickname.trim();
        nicknames[name] = nickname;

        storage.set('nicknames', nicknames);

        return nickname;
    }

    get(name) {
        return nicknames[name] || null;
    }
}

module.exports = new ChatNicknamesModule();
