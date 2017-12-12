const watcher = require('../../watcher');
const storage = require('../../storage');
const twitch = require('../../utils/twitch');

const DEFAULT_SIZE = 200;
const PROMPT_BODY = `Change the number of messages the chat is able to scrollback to. Increasing this value can slow down your browser...
Leaving this value empty restore default settings.
`;

function changeSizeSettings(promptBody, storageID) {
    const size = prompt(promptBody, storage.get(storageID) || DEFAULT_SIZE);
    if (size !== null) {
        storage.set(storageID, size.trim());
    }
}

function updateSizeSettings() {
    const sizeString = storage.get('chatScrollbackSize') || '';
    let size;
    if (sizeString.trim().length === 0) {
        size = DEFAULT_SIZE;
    } else {
        try {
            size = parseInt(sizeString, 10);
        } catch (_) {
            size = DEFAULT_SIZE;
        }
    }
    try {
        twitch.getChatController().chatBuffer.maxSize = size;
    } catch (_) {}
}


class ChatScrollbackSizeModule {
    constructor() {
        watcher.on('load.chat', updateSizeSettings);
        storage.on('changed.chatScrollbackSize', updateSizeSettings);
    }

    setChatScrollbackSize() {
        changeSizeSettings(PROMPT_BODY, 'chatScrollbackSize');
    }
}


module.exports = new ChatScrollbackSizeModule();
