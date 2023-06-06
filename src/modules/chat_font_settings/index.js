import {PlatformTypes} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import storage from '../../storage.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

const FONT_FAMILY_PROMPT = formatMessage({
  defaultMessage: `Enter a font family for chat.

Try "monospace" or "Comic Sans MS", or leave the field blank to use the default.`,
});
const FONT_SIZE_PROMPT = formatMessage({
  defaultMessage: `Enter a font size for chat.

Leave the field blank to use the default.`,
});

const STYLE_ID = 'bttv-font-size';
const GENERIC_FONT_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

function formatFontFamily(fontFamily) {
  return GENERIC_FONT_FAMILIES.includes(fontFamily) ? fontFamily : `"${fontFamily}", sans-serif`;
}

const styleTemplate = (fontFamily, fontSize) => `
section[data-test-selector="chat-room-component-layout"] .chat-scrollable-area__message-container,
.whispers .thread-message__message, .video-chat__message {
    font-family: ${fontFamily ? formatFontFamily(fontFamily) : 'inherit'} !important;
    font-size: ${fontSize ? `${fontSize}px` : 'inherit'} !important;
    line-height: ${fontSize ? `${(+fontSize + fontSize * 0.66).toFixed(2)}px` : 'inherit'} !important;
}
`;

let fontSettings;

function updateFontSettings() {
  if (fontSettings == null) {
    fontSettings = document.createElement('style');
    fontSettings.id = STYLE_ID;
    document.body.appendChild(fontSettings);
  }

  fontSettings.innerText = styleTemplate(storage.get('chatFontFamily'), storage.get('chatFontSize'));
}

function changeFontSetting(promptBody, storageID) {
  /* eslint-disable-next-line no-alert */
  let keywords = prompt(promptBody, storage.get(storageID) || '');
  if (keywords !== null) {
    keywords = keywords.trim();
    storage.set(storageID, keywords);
    updateFontSettings();
  }
}

class ChatFontSettingsModule {
  constructor() {
    watcher.on('load', updateFontSettings);
  }

  setFontFamily() {
    changeFontSetting(FONT_FAMILY_PROMPT, 'chatFontFamily');
  }

  setFontSize() {
    changeFontSetting(FONT_SIZE_PROMPT, 'chatFontSize');
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatFontSettingsModule()]);
