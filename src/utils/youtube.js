import {createSrc, createSrcSet} from './image.js';

export function findFocusedWord(value, selectionStart = 0) {
  const subString = value.substring(0, selectionStart);
  const focusedWords = subString.split(/\s+/);
  const focusedWord = focusedWords[focusedWords.length - 1];

  return {
    value: focusedWord,
    start: subString.length - focusedWord.length,
    end: selectionStart,
  };
}

/** Matches EmoteMenu / YouTube live chat contenteditable input. */
export const YOUTUBE_CHAT_CONTENTEDITABLE_SELECTOR = 'div#input[contenteditable]';

export function getCaretOffsetInContentEditable(element) {
  const selection = document.getSelection();
  if (selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) {
    return null;
  }

  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.startContainer, range.startOffset);
  return preCaretRange.toString().length;
}

export function getYoutubeChatInputPartialCommand(commandPrefix = '!') {
  const element = document.querySelector(YOUTUBE_CHAT_CONTENTEDITABLE_SELECTOR);
  if (element == null) {
    return null;
  }

  const caret = getCaretOffsetInContentEditable(element);
  if (caret == null) {
    return null;
  }

  const value = element.innerText;
  if (value == null) {
    return null;
  }

  const {value: focusedWord} = findFocusedWord(value, caret);
  const firstWord = value.split(' ')[0].trim();

  if (caret > firstWord.length) {
    return null;
  }

  if (firstWord !== focusedWord) {
    return null;
  }

  if (!focusedWord.startsWith(commandPrefix)) {
    return null;
  }

  return focusedWord;
}

export function setYoutubeChatInputValue(text, shouldFocus = true) {
  const element = document.querySelector(YOUTUBE_CHAT_CONTENTEDITABLE_SELECTOR);
  if (element == null) {
    return;
  }

  element.textContent = text;
  element.dispatchEvent(new Event('input', {bubbles: true}));

  if (shouldFocus) {
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function createYoutubeEmojiNode(emote) {
  const newNode = document.createElement('img');
  newNode.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
  newNode.src = createSrc(emote.images);
  newNode.srcset = createSrcSet(emote.images);
  newNode.alt = emote.code;
  newNode.setAttribute('data-emoji-id', emote.id);
  return newNode;
}

export function getElementData(element) {
  if (element == null) {
    return null;
  }

  return element.__data?.data ?? element.data ?? element.__data;
}

export function getLiveChat() {
  return getElementData(document.getElementsByTagName('yt-live-chat-renderer')[0]);
}
