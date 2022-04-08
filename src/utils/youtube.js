/* eslint-disable import/prefer-default-export */
export function createYoutubeEmojiNode(emote) {
  const newNode = document.createElement('img');
  newNode.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
  newNode.src = emote.images['1x'];
  newNode.alt = emote.code;
  newNode.setAttribute('data-emoji-id', emote.id);
  return newNode;
}
