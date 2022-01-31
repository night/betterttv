import domObserver from '../observers/dom.js';
import {setCurrentUser} from '../utils/user.js';
import {setCurrentChannel} from '../utils/channel.js';

export default function youtubeWatcher(watcher) {
  function updateUser() {
    const inputRenderer = document.getElementsByTagName('yt-live-chat-message-input-renderer')[0];
    if (inputRenderer == null) {
      return;
    }

    try {
      const user =
        inputRenderer.__data.data.sendButton.buttonRenderer.serviceEndpoint.sendLiveChatMessageEndpoint.actions[0]
          .addLiveChatTextMessageFromTemplateAction.template.liveChatTextMessageRenderer;
      const userThumbnails = user.authorPhoto.thumbnails;
      setCurrentUser({
        provider: 'youtube',
        id: user.authorExternalChannelId,
        name: user.authorExternalChannelId,
        displayName: user.authorName.simpleText,
        avatar: (userThumbnails[1] || userThumbnails[0]).url,
      });
      watcher.emit('load.user');
    } catch (_) {}
  }

  let channelId;
  function updateChannel({data}) {
    let newChannelId = channelId;

    const liveChatItemContextMenuEndpointParams = data?.contextMenuEndpoint?.liveChatItemContextMenuEndpoint?.params;
    const sendLiveChatMessageEndpointParams = data?.actionPanel?.liveChatMessageInputRenderer?.sendButton?.buttonRenderer?.serviceEndpoint?.sendLiveChatMessageEndpoint?.params;
    const endpointParams = liveChatItemContextMenuEndpointParams || sendLiveChatMessageEndpointParams;
    if (endpointParams != null) {
      const decodedParams = atob(decodeURIComponent(atob(liveChatItemContextMenuEndpointParams)));
      // this is proto but we don't know the schema and we don't wanna import a proto lib to decode this
      // this is "probably" going to work ok.
      // eslint-disable-next-line prefer-destructuring
      newChannelId = decodedParams.split("*'\n\u0018")[1].split('\u0012\u000b')[0];
    }

    if (newChannelId == null) {
      const metaChannelId = document.querySelector('meta[itemprop="channelId"]');
      if (metaChannelId != null) {
        newChannelId = metaChannelId.getAttribute('content');
      }
    }

    if (newChannelId == null || newChannelId === channelId) {
      return;
    }

    channelId = newChannelId;
    setCurrentChannel({provider: 'youtube', id: channelId});
    updateUser();
    watcher.emit('load.youtube');
    watcher.emit('load.channel');
  }

  function processMessageNode(node) {
    // the closest <yt-live-chat-text-message-renderer> is the message root
    let newNode = node.closest('yt-live-chat-text-message-renderer');
    // we also support comment roots
    if (newNode == null) {
      newNode = node.closest('ytd-comment-renderer');
    }
    node = newNode;
    if (node == null) {
      return;
    }
    // prevent reprocessing messages
    if (node.querySelector('.bttv-message-container')) {
      return;
    }
    updateChannel(node.__data);
    watcher.emit('youtube.message', node, node.__data);
  }

  domObserver.on(
    '#message,.bttv-message-container',
    (node, isConnected) => {
      // youtube sometimes re-renders lines, which may remove our content span
      if (node.className !== 'bttv-message-container' && !isConnected) {
        return;
      }
      processMessageNode(node);
    },
    {
      useTargetNode: true,
    }
  );

  domObserver.on('#live-chat-message-input', () => {
    updateUser();
    updateChannel(document.getElementsByTagName('yt-live-chat-renderer')[0]?.__data);
  });

  watcher.on('emotes.updated', () => {
    for (const node of document.querySelectorAll('span#message')) {
      processMessageNode(node);
    }
  });
}
