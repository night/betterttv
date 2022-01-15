import {PlatformTypes} from '../constants.js';
import {loadModuleForPlatforms} from './modules.js';
import twitch, {SelectionTypes} from './twitch.js';

const CHAT_TEXT_AREA = 'div#input[contenteditable]';

function findFocusedWord(parts = [], selectionStart = 0) {
  let total = 0;

  for (const part of parts) {
    if (selectionStart > total && selectionStart <= total + part.length) {
      return part;
    }
    total += part.length + 1;
  }

  return null;
}

// TODO: consider selection position
function getTwitchAutocompletable() {
  const value = twitch.getChatInputValue();
  const selection = twitch.getChatInputSelection();

  if (selection !== SelectionTypes.END) {
    return null;
  }

  const focusedWord = value.split(' ').at(-1);
  if (focusedWord == null || !focusedWord.startsWith(':') || focusedWord.endsWith(':')) {
    return null;
  }

  return focusedWord;
}

function getYoutubeAutocompletable() {
  const element = document.querySelector(CHAT_TEXT_AREA);
  const focusedWord = findFocusedWord(element.textContent.split(' '), document.getSelection().focusOffset);

  if (focusedWord == null || !focusedWord.startsWith(':') || focusedWord.endsWith(':')) {
    return null;
  }

  return focusedWord;
}

export const getAutocompletable = loadModuleForPlatforms(
  [PlatformTypes.TWITCH, () => getTwitchAutocompletable],
  [PlatformTypes.YOUTUBE, () => getYoutubeAutocompletable]
);

export function isEmoteAutocompletable() {
  return getAutocompletable() != null;
}
