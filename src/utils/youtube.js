import ReactDOM from 'react-dom';

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

let YoutubeEphemeralMessage = null;
export async function sendEphemeralMessage(message) {
  const items = document.querySelector('.yt-live-chat-item-list-renderer > #items');
  if (items == null) {
    return;
  }
  const visibleItems = getLiveChat()?.visibleItems;
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
  items.appendChild(bttvMessageContainer);
}
