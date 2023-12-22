import React from 'react';
import ReactDOM from 'react-dom/client';
import watcher from '../watcher.js';
import {getElementData} from './youtube.js';

const CHAT_ITEMS_SELECTOR = '.yt-live-chat-item-list-renderer > #items';

const MAX_EPHEMERAL_MESSAGE_DEPTH = 50;
let youtubeMessageListener = null;
let renderedEphemeralMessages = [];
function unmountExpiredEphemeralMessage() {
  const chatItems = Array.from(document.querySelector(CHAT_ITEMS_SELECTOR)?.children ?? []);
  const maxIndex = chatItems.length - MAX_EPHEMERAL_MESSAGE_DEPTH;
  const messagesToKeep = renderedEphemeralMessages.filter(({message}) => {
    const index = chatItems.indexOf(message);
    return index >= maxIndex;
  });

  for (const renderedMessage of renderedEphemeralMessages) {
    if (messagesToKeep.includes(renderedMessage)) {
      continue;
    }
    const {message, messageRoot} = renderedMessage;
    messageRoot.unmount();
    message.remove();
  }

  renderedEphemeralMessages = messagesToKeep;
  if (renderedEphemeralMessages.length === 0 && youtubeMessageListener != null) {
    youtubeMessageListener?.();
    youtubeMessageListener = null;
  }
}

let YoutubeEphemeralMessage = null;
// eslint-disable-next-line import/prefer-default-export
export async function sendEphemeralMessage(message) {
  const items = document.querySelector(CHAT_ITEMS_SELECTOR);
  if (items == null) {
    return;
  }
  const visibleItems = getElementData(items?.__dataHost);
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
  renderedEphemeralMessages.push({message: bttvMessageContainer, messageRoot: root});
  items.appendChild(bttvMessageContainer);

  unmountExpiredEphemeralMessage();
  if (youtubeMessageListener == null) {
    youtubeMessageListener = watcher.on('youtube.message', () => unmountExpiredEphemeralMessage());
  }
}
