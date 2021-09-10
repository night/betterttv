import domObserver from '../observers/dom.js';
import {setCurrentUser} from '../utils/user.js';
import {setCurrentChannel} from '../utils/channel.js';

export default function youtubeWatcher(watcher) {
  let channelId;
  function updateChannel({data}) {
    const metaChannelId = document.querySelector('meta[itemprop="channelId"]');
    let newChannelId = channelId;
    if (metaChannelId != null) {
      newChannelId = metaChannelId.getAttribute('content');
    }

    const liveChatItemContextMenuEndpointParams = data.contextMenuEndpoint?.liveChatItemContextMenuEndpoint?.params;
    if (liveChatItemContextMenuEndpointParams != null) {
      const decodedParams = atob(decodeURIComponent(atob(liveChatItemContextMenuEndpointParams)));
      // this is proto but we don't know the schema and we don't wanna import a proto lib to decode this
      // this is "probably" going to work ok.
      // eslint-disable-next-line prefer-destructuring
      newChannelId = decodedParams.split("*'\n\u0018")[1].split('\u0012\u000b')[0];
    }

    if (newChannelId === channelId) {
      return;
    }

    channelId = newChannelId;
    setCurrentChannel({provider: 'youtube', id: channelId});
    watcher.emit('load.youtube');
    watcher.emit('load.channel');
  }

  function updateUser() {
    const inputRenderer = document.getElementsByTagName('yt-live-chat-message-input-renderer')[0];
    if (inputRenderer == null) {
      return;
    }

    try {
      const user =
        inputRenderer.__data.data.sendButton.buttonRenderer.serviceEndpoint.sendLiveChatMessageEndpoint.actions[0]
          .addLiveChatTextMessageFromTemplateAction.template.liveChatTextMessageRenderer;
      setCurrentUser({
        provider: 'youtube',
        id: user.authorExternalChannelId,
        name: user.authorExternalChannelId,
        displayName: user.authorName.simpleText,
      });
    } catch (_) {}
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
    '#message,#content-text,.bttv-message-container',
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

  watcher.on('emotes.updated', () => {
    for (const node of document.querySelectorAll('span#message')) {
      processMessageNode(node);
    }
    for (const node of document.querySelectorAll('yt-formatted-string#content-text')) {
      processMessageNode(node);
    }
  });

  updateUser();
}
