import {createSrc, createSrcSet} from './image.js';

/* eslint-disable import/prefer-default-export */
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

  return element.__data?.data ?? element.data;
}

export function getLiveChat() {
  return getElementData(document.getElementsByTagName('yt-live-chat-renderer')[0]);
}
