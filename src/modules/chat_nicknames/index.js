import formatMessage from '../../i18n/index.js';
import storage from '../../storage.js';

let nicknames;

class ChatNicknamesModule {
  constructor() {
    nicknames = storage.get('nicknames') || {};
  }

  set(name) {
    /* eslint-disable-next-line no-alert */
    let nickname = prompt(
      formatMessage({defaultMessage: 'Enter the updated nickname for {name} (Leave blank to reset)'}, {name}),
      nicknames[name] || name
    );
    if (nickname === null) return null;

    nickname = nickname.trim();
    nicknames[name] = nickname;

    storage.set('nicknames', nicknames);

    return nickname;
  }

  get(name) {
    return nicknames[name] || null;
  }
}

export default new ChatNicknamesModule();
