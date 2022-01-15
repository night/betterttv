import twitch, {SelectionTypes} from './twitch.js';

export function getAutocompletable() {
  const value = twitch.getChatInputValue();
  const selection = twitch.getChatInputSelection();

  if (selection !== SelectionTypes.END) {
    return null;
  }

  const focusedWord = value.split(' ').at(-1);

  if (focusedWord == null || !focusedWord.startsWith(':')) {
    return null;
  }

  return focusedWord;
}

export function isEmoteAutocompletable() {
  return getAutocompletable() != null;
}
