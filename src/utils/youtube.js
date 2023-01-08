import React from 'react';
import ReactDOM from 'react-dom/client';
import watcher from '../watcher.js';

const CHAT_ITEMS_SELECTOR = '.yt-live-chat-item-list-renderer > #items';

export function createYoutubeEmojiNode(emote) {
  const newNode = document.createElement('img');
  newNode.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
  newNode.src = emote.images['1x'];
  newNode.alt = emote.code;
  newNode.setAttribute('data-emoji-id', emote.id);
  return newNode;
}

export function getLiveChat() {
  return document.getElementsByTagName('yt-live-chat-renderer')[0]?.__data?.data;
}

const MAX_EPHEMERAL_MESSAGE_DEPTH = 10;
let youtubeMessageListener = null;
let renderedEphemeralMessages = [];
function unmountExpiredEphemeralMessage() {
  const chatItemsContainer = document.querySelector(CHAT_ITEMS_SELECTOR);
  if (chatItemsContainer == null) {
    return;
  }
  const chatItems = Array.from(chatItemsContainer.children);
  if (chatItems == null || chatItems.length < MAX_EPHEMERAL_MESSAGE_DEPTH) {
    return;
  }
  renderedEphemeralMessages = renderedEphemeralMessages.filter((message) => {
    const index = chatItems.indexOf(message);
    if (index < chatItems.length - MAX_EPHEMERAL_MESSAGE_DEPTH) {
      message.remove();
      return false;
    }
    return true;
  });
  if (renderedEphemeralMessages.length === 0 && youtubeMessageListener != null) {
    youtubeMessageListener?.();
    youtubeMessageListener = null;
  }
}

let YoutubeEphemeralMessage = null;
export async function sendEphemeralMessage(message) {
  const items = document.querySelector(CHAT_ITEMS_SELECTOR);
  if (items == null) {
    return;
  }
  const visibleItems = items?.__dataHost?.__data?.visibleItems;
  if (visibleItems == null) {
    return;
  }
  if (YoutubeEphemeralMessage == null) {
    YoutubeEphemeralMessage = (await import('../common/components/YoutubeEphemeralMessage.jsx')).default;
  }
  const bttvMessageContainer = document.createElement('div');
  bttvMessageContainer.id = 'bttv-chat-admin-message';
  const root = ReactDOM.createRoot(bttvMessageContainer);
  /* eslint-disable-next-line react/jsx-filename-extension, react/react-in-jsx-scope */
  root.render(<YoutubeEphemeralMessage message={message} />);
  // Forces youtube to append following messages after the ephemeral message
  visibleItems.push({bttvMessageRenderer: {}});
  renderedEphemeralMessages.push(bttvMessageContainer);
  items.appendChild(bttvMessageContainer);

  unmountExpiredEphemeralMessage();
  if (youtubeMessageListener == null) {
    youtubeMessageListener = watcher.on('youtube.message', () => unmountExpiredEphemeralMessage());
  }
}

window.sendChat = sendEphemeralMessage;
