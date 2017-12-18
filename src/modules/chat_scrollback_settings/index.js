const watcher = require('../../watcher');
const storage = require('../../storage');
const twitch = require('../../utils/twitch');
const debug = require('../../utils/debug');

const PROMPT_BODY = `Change the number of messages the chat is able to scrollback to. Increasing this value can slow down your browser...

Leave the field blank to use the default.
`;

const STORAGE_ID = 'scrollbackAmount';
let initialValue;

function setChatBufferSize(value) {
    if (!value) return;
    try {
        twitch.getChatController().chatBuffer.maxSize = value;
    } catch (_) {}
}

function getChatBufferSize() {
    try {
        return twitch.getChatController().chatBuffer.maxSize;
    } catch (_) {}
}

function checkError() {
    if (!getChatBufferSize()) {
        debug.error('"chatBuffer.maxSize" is undefined, did twitch change the path to the chatBuffer?');
        return true;
    }
    return false;
}

function promptSizeSettings() {
    if (checkError()) return;

    const sizeString = prompt(PROMPT_BODY, getChatBufferSize());
    if (sizeString !== null) {
        let size;
        if (sizeString.trim().length === 0) {
            size = initialValue;
        } else {
            size = parseInt(sizeString, 10);
            if (!size) return;
        }
        storage.set(STORAGE_ID, size);
    }
}

function updateSizeSettings() {
    if (checkError()) return;

    setChatBufferSize(storage.get(STORAGE_ID));
}

class ChatScrollbackSizeModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
        storage.on(`changed.${STORAGE_ID}`, updateSizeSettings);
    }

    load() {
        initialValue = getChatBufferSize();
        updateSizeSettings();
    }

    setChatScrollbackSize() {
        promptSizeSettings();
    }
}


module.exports = new ChatScrollbackSizeModule();
