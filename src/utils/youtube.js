import _ from 'lodash';
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

const MAX_EPHMERAL_MESSAGE_DEPTH = 100;
let YoutubeMessageListener = null;
function unmountExpiredEphemeralMessage() {
  const chatItems = document.querySelector(CHAT_ITEMS_SELECTOR);
  if (chatItems == null) {
    return;
  }
  const visibleItems = chatItems?.__dataHost?.__data?.visibleItems;
  if (visibleItems == null || visibleItems.length < MAX_EPHMERAL_MESSAGE_DEPTH) {
    return;
  }
  let hasEphemeralMessage = false;
  chatItems.__dataHost.__data.visibleItems = visibleItems.filter((item, index, items) => {
    if (item.bttvMessageRenderer != null) {
      if (index < items.length - MAX_EPHMERAL_MESSAGE_DEPTH) {
        item.bttvMessageRenderer.node.unmount();
        return false;
      }
      hasEphemeralMessage = true;
    }
    return true;
  });
  if (!hasEphemeralMessage) {
    YoutubeMessageListener?.();
    YoutubeMessageListener = null;
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
  visibleItems.push({bttvMessageRenderer: {node: root}});
  items.appendChild(bttvMessageContainer);

  unmountExpiredEphemeralMessage();
  if (YoutubeMessageListener == null) {
    YoutubeMessageListener = watcher.on('youtube.message', () => unmountExpiredEphemeralMessage());
  }
}

window.sendChat = sendEphemeralMessage;
