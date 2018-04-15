const $ = require('jquery');
const watcher = require('../../watcher');
const storage = require('../../storage');
const html = require('../../utils/html');

const FONT_FAMILY_PROMPT = `Enter a font family for chat.

Try "monospace" or "Comic Sans MS", or leave the field blank to use the default.`;
const FONT_SIZE_PROMPT = `Enter a font size for chat.

Leave the field blank to use the default.`;

const STYLE_ID = 'bttv-font-size';
const GENERIC_FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

function encodeFontFamily(fontFamily) {
    return GENERIC_FONT_FAMILIES.includes(fontFamily) ? fontFamily : `"${html.escape(fontFamily)}", sans-serif`;
}

function changeFontSetting(promptBody, storageID) {
    let keywords = prompt(promptBody, storage.get(storageID) || '');
    if (keywords !== null) {
        keywords = keywords.trim();
        storage.set(storageID, keywords);
    }
}

const styleTemplate = (fontFamily, fontSize) => `
section[data-test-selector="chat-room-component-layout"] .chat-list__lines, .whispers .thread-message__message {
    font-family: ${fontFamily ? encodeFontFamily(fontFamily) : 'inherit'} !important;
    font-size: ${fontSize ? `${html.escape(fontSize)}px` : 'inherit'} !important;
}
`;

let $fontSettings;

function updateFontSettings() {
    if (!$fontSettings) {
        $fontSettings = $(`<style id="${STYLE_ID}" />`).appendTo('body');
    }

    const template = styleTemplate(storage.get('chatFontFamily'), storage.get('chatFontSize'));
    $fontSettings.html(template);
}

class ChatFontSettingsModule {
    constructor() {
        watcher.on('load', updateFontSettings);
        storage.on('changed.chatFontFamily', updateFontSettings);
        storage.on('changed.chatFontSize', updateFontSettings);
    }

    setFontFamily() {
        changeFontSetting(FONT_FAMILY_PROMPT, 'chatFontFamily');
    }

    setFontSize() {
        changeFontSetting(FONT_SIZE_PROMPT, 'chatFontSize');
    }
}

module.exports = new ChatFontSettingsModule();
