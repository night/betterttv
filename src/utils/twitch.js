import $ from 'jquery';
import cookies from 'cookies-js';
import twitchAPI from './twitch-api.js';
import debug from './debug.js';
import {getCurrentUser, setCurrentUser} from './user.js';
import {getCurrentChannel, setCurrentChannel} from './channel.js';

const REACT_ROOT = '#root';
const CHAT_CONTAINER = 'section[data-test-selector="chat-room-component-layout"]';
const VOD_CHAT_CONTAINER = '.qa-vod-chat,.va-vod-chat';
const CHAT_LIST = '.chat-list,.chat-list--default,.chat-list--other';
const PLAYER = 'div[data-a-target="player-overlay-click-handler"]';
const CLIPS_BROADCASTER_INFO = '.clips-broadcaster-info';
const CHAT_MESSAGE_SELECTOR = '.chat-line__message';
const CHAT_INPUT = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const CHAT_WYSIWYG_INPUT_EDITOR = '.chat-wysiwyg-input__editor';
const COMMUNITY_HIGHLIGHT = '.community-highlight';

const USER_PROFILE_IMAGE_GQL_QUERY = `
  query GetUserProfilePicture($userId: ID!) {
    user(id: $userId) {
      profileImageURL(width: 300)
    }
  }
`;

const TMIActionTypes = {
  MESSAGE: 0,
  EXTENSION_MESSAGE: 1,
  MODERATION: 2,
  MODERATION_ACTION: 3,
  TARGETED_MODERATION_ACTION: 4,
  AUTO_MOD: 5,
  SUBSCRIBER_ONLY_MODE: 6,
  FOLLOWERS_ONLY_MODE: 7,
  SLOW_MODE: 8,
  EMOTE_ONLY_MODE: 9,
  R9K_MODE: 10,
  CONNECTED: 11,
  DISCONNECTED: 12,
  RECONNECT: 13,
  HOSTING: 14,
  UNHOST: 15,
  HOSTED: 16,
  SUBSCRIPTION: 17,
  RESUBSCRIPTION: 18,
  GIFT_PAID_UPGRADE: 19,
  ANON_GIFT_PAID_UPGRADE: 20,
  PRIME_PAID_UPGRADE: 21,
  PRIME_COMMUNITY_GIFT_RECEIVED_EVENT: 22,
  EXTEND_SUBSCRIPTION: 23,
  SUB_GIFT: 24,
  ANON_SUB_GIFT: 25,
  CLEAR_CHAT: 26,
  ROOM_MODS: 27,
  ROOM_STATE: 28,
  RAID: 29,
  UNRAID: 30,
  RITUAL: 31,
  NOTICE: 32,
  INFO: 33,
  BADGES_UPDATED: 34,
  PURCHASE: 35,
  BITS_CHARITY: 36,
  CRATE_GIFT: 37,
  REWARD_GIFT: 38,
  SUB_MYSTERY_GIFT: 39,
  ANON_SUB_MYSTERY_GIFT: 40,
  FIRST_CHEER_MESSAGE: 41,
  BITS_BADGE_TIER_MESSAGE: 42,
  INLINE_PRIVATE_CALLOUT: 43,
  CHANNEL_POINTS_AWARD: 44,
};

export function getReactInstance(element) {
  for (const key in element) {
    if (key.startsWith('__reactInternalInstance$')) {
      return element[key];
    }
  }

  return null;
}

function getReactRoot(element) {
  for (const key in element) {
    if (key.startsWith('_reactRootContainer')) {
      return element[key];
    }
  }

  return null;
}

function searchReactParents(node, predicate, maxDepth = 15, depth = 0) {
  try {
    if (predicate(node)) {
      return node;
    }
  } catch (_) {}

  if (!node || depth > maxDepth) {
    return null;
  }

  const {return: parent} = node;
  if (parent) {
    return searchReactParents(parent, predicate, maxDepth, depth + 1);
  }

  return null;
}

function searchReactChildren(node, predicate, maxDepth = 15, depth = 0) {
  try {
    if (predicate(node)) {
      return node;
    }
  } catch (_) {}

  if (!node || depth > maxDepth) {
    return null;
  }

  const {child, sibling} = node;
  if (child || sibling) {
    return (
      searchReactChildren(child, predicate, maxDepth, depth + 1) ||
      searchReactChildren(sibling, predicate, maxDepth, depth + 1)
    );
  }

  return null;
}

let chatClient;
const profilePicturesByUserId = {};

const userCookie = cookies.get('twilight-user');
if (userCookie) {
  try {
    const {authToken, id, login, displayName} = JSON.parse(userCookie);
    twitchAPI.setAccessToken(authToken);
    setCurrentUser({
      provider: 'twitch',
      id: id.toString(),
      name: login,
      displayName,
    });
  } catch (_) {}
}

export const SelectionTypes = {
  START: 1,
  MIDDLE: 2,
  END: 3,
};

export default {
  async getUserProfilePicture(userId = null) {
    const currentUser = getCurrentUser();
    if (currentUser == null || currentUser.provider !== 'twitch') {
      return null;
    }

    if (userId == null) {
      userId = currentUser.id;
    }

    if (userId == null) {
      return null;
    }

    let profilePicture = profilePicturesByUserId[userId];
    if (profilePicture != null) {
      return profilePicture;
    }

    try {
      const {data} = await twitchAPI.graphqlQuery(USER_PROFILE_IMAGE_GQL_QUERY, {userId});
      profilePicture = data.user.profileImageURL;
    } catch (e) {
      debug.log('failed to fetch twitch user profile', e);
      return null;
    }

    profilePicturesByUserId[userId] = profilePicture;

    return profilePicture;
  },

  updateCurrentChannel() {
    let rv;

    const clipsBroadcasterInfo = this.getClipsBroadcasterInfo();
    if (clipsBroadcasterInfo) {
      rv = {
        id: clipsBroadcasterInfo.id,
        name: clipsBroadcasterInfo.login,
        displayName: clipsBroadcasterInfo.displayName,
        avatar: clipsBroadcasterInfo.profileImageURL,
      };
    }

    const currentChat = this.getCurrentChat();
    if (currentChat && currentChat.props && currentChat.props.channelID) {
      const {channelID, channelLogin, channelDisplayName} = currentChat.props;
      rv = {
        id: channelID.toString(),
        name: channelLogin,
        displayName: channelDisplayName,
      };
    }

    const currentVodChat = this.getCurrentVodChat();
    if (currentVodChat && currentVodChat.props && currentVodChat.props.data && currentVodChat.props.data.video) {
      const {
        owner: {id, login},
      } = currentVodChat.props.data.video;
      rv = {
        id: id.toString(),
        name: login,
        displayName: login,
      };
    }

    if (rv != null) {
      setCurrentChannel({provider: 'twitch', ...rv});
    }

    return rv;
  },

  TMIActionTypes,

  getReactInstance,

  getConnectStore() {
    let store;
    try {
      const node = searchReactChildren(
        getReactRoot($(REACT_ROOT)[0])._internalRoot.current,
        (n) => n.pendingProps && n.pendingProps.value && n.pendingProps.value.store
      );
      store = node.pendingProps.value.store;
    } catch (_) {}

    return store;
  },

  getAutocompleteStateNode() {
    let node;
    try {
      node = searchReactParents(
        getReactInstance($(CHAT_WYSIWYG_INPUT_EDITOR)[0]),
        (n) => n?.stateNode?.providers != null,
        30
      );
    } catch (_) {}

    return node;
  },

  getClipsBroadcasterInfo() {
    let broadcaster;
    try {
      const node = searchReactParents(
        getReactInstance($(CLIPS_BROADCASTER_INFO)[0]),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.data && n.stateNode.props.data.clip
      );
      broadcaster = node.stateNode.props.data.clip.broadcaster;
    } catch (_) {}

    return broadcaster;
  },

  getCurrentPlayer() {
    let player;
    try {
      const node = searchReactParents(
        getReactInstance($(PLAYER)[0]),
        (n) => n.memoizedProps?.mediaPlayerInstance?.core != null,
        30
      );
      player = node.memoizedProps.mediaPlayerInstance.core;
    } catch (e) {}

    return player;
  },

  getChatController() {
    let chatContentComponent;
    try {
      const node = searchReactParents(
        getReactInstance($(CHAT_CONTAINER)[0]),
        (n) => n.stateNode?.props?.chatConnectionAPI,
        25
      );
      chatContentComponent = node.stateNode;
    } catch (_) {}

    return chatContentComponent;
  },

  getChatServiceClient() {
    if (chatClient) return chatClient;

    try {
      const node = searchReactChildren(
        getReactRoot($(REACT_ROOT)[0])._internalRoot.current,
        (n) => n.stateNode && n.stateNode.join && n.stateNode.client,
        1000
      );
      chatClient = node.stateNode.client;
    } catch (_) {}

    return chatClient;
  },

  getChatServiceSocket() {
    let socket;
    try {
      socket = this.getChatServiceClient().connection.ws;
    } catch (_) {}
    return socket;
  },

  getChatBuffer() {
    let chatList;
    try {
      const node = searchReactParents(
        getReactInstance($(CHAT_LIST)[0]),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.messageBufferAPI
      );
      chatList = node.stateNode;
    } catch (_) {}

    return chatList;
  },

  getChatScroller() {
    let chatScroller;
    try {
      const node = searchReactChildren(
        getReactInstance($(CHAT_LIST)[0]),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.scrollRef
      );
      chatScroller = node.stateNode;
    } catch (_) {}

    return chatScroller;
  },

  getCurrentEmotes() {
    let currentEmotes;

    if (currentEmotes != null) {
      return currentEmotes;
    }

    try {
      const node = searchReactParents(
        getReactInstance($(CHAT_CONTAINER)[0]),
        (n) =>
          n.stateNode &&
          n.stateNode.props &&
          n.stateNode.props.emoteSetsData &&
          n.stateNode.props.emoteSetsData.emoteMap
      );
      currentEmotes = node.stateNode.props.emoteSetsData;
    } catch (_) {}

    return currentEmotes;
  },

  getCurrentChat() {
    let currentChat;
    try {
      const node = searchReactParents(
        getReactInstance($(CHAT_CONTAINER)[0]),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.onSendMessage
      );
      currentChat = node.stateNode;
    } catch (_) {}

    return currentChat;
  },

  getCurrentVodChat() {
    let currentVodChat;
    try {
      const node = searchReactParents(
        getReactInstance($(VOD_CHAT_CONTAINER)[0]),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.data && n.stateNode.props.data.video
      );
      currentVodChat = node.stateNode;
    } catch (_) {}

    return currentVodChat;
  },

  sendChatAdminMessage(body) {
    const chatController = this.getChatController();
    if (!chatController) return;

    const id = Date.now();

    chatController.pushMessage({
      type: TMIActionTypes.NOTICE,
      id,
      msgid: id,
      message: body,
      channel: `#${chatController.props.channelLogin}`,
    });
  },

  sendChatMessage(message) {
    const currentChat = this.getCurrentChat();
    if (!currentChat) return;
    currentChat.props.onSendMessage(message);
  },

  getCurrentUserIsModerator() {
    const currentChat = this.getCurrentChat();
    if (!currentChat) {
      return false;
    }
    return currentChat.props.isCurrentUserModerator;
  },

  getChatMessageObject(element) {
    let msgObject;
    try {
      msgObject = getReactInstance(element).return.stateNode.props.message;
    } catch (_) {}

    return msgObject;
  },

  getConversationMessageObject(element) {
    let msgObject;
    try {
      const node = searchReactParents(
        getReactInstance(element),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.message
      );
      msgObject = node.stateNode.props.message;
    } catch (_) {}

    return msgObject;
  },

  getConversationThreadId(element) {
    let conversationThreadId;
    try {
      const node = searchReactParents(
        getReactInstance(element),
        (n) =>
          (n.stateNode && n.stateNode.props && n.stateNode.props.threadID) ||
          (n.memoizedProps && n.memoizedProps.whisperThreadID)
      );
      conversationThreadId =
        (node.stateNode && node.stateNode.props && node.stateNode.props.threadID) ||
        (node.memoizedProps && node.memoizedProps.whisperThreadID);
    } catch (_) {}

    return conversationThreadId || null;
  },

  getChatModeratorCardUser(element) {
    let user;
    try {
      const node = searchReactChildren(
        getReactInstance(element),
        (n) => n.stateNode && n.stateNode.props && n.stateNode.props.targetUserID && n.stateNode.props.targetLogin,
        20
      );
      const {props} = node.stateNode;
      user = {
        id: props.targetUserID,
        login: props.targetLogin,
        displayName: props.targetDisplayName || props.targetLogin,
      };
    } catch (_) {}

    if (!user) {
      try {
        const node = searchReactParents(
          getReactInstance(element),
          (n) =>
            n.stateNode &&
            n.stateNode.props &&
            n.stateNode.props.channelID &&
            n.stateNode.props.channelLogin &&
            n.stateNode.props.targetLogin &&
            n.stateNode.props.channelLogin === n.stateNode.props.targetLogin,
          20
        );
        const {props} = node.stateNode;
        user = {
          id: props.channelID,
          login: props.channelLogin,
          displayName: props.channelDisplayName || props.channelLogin,
        };
      } catch (_) {}
    }

    return user;
  },

  getUserIsModeratorFromTagsBadges(badges) {
    if (!badges) return false;
    badges = Array.isArray(badges) ? badges.map((b) => b.id) : Object.keys(badges);
    return (
      badges.includes('moderator') ||
      badges.includes('broadcaster') ||
      badges.includes('global_mod') ||
      badges.includes('admin') ||
      badges.includes('staff')
    );
  },

  getUserIsOwnerFromTagsBadges(badges) {
    if (!badges) return false;
    badges = Array.isArray(badges) ? badges.map((b) => b.id) : Object.keys(badges);
    return (
      badges.includes('broadcaster') ||
      badges.includes('global_mod') ||
      badges.includes('admin') ||
      badges.includes('staff')
    );
  },

  getCurrentUserIsOwner() {
    const currentUser = getCurrentUser();
    const currentChannel = getCurrentChannel();
    if (!currentUser || !currentChannel) return false;
    return currentUser.id === currentChannel.id;
  },

  getChatInput(element = null) {
    let chatInput;
    try {
      chatInput = searchReactParents(
        getReactInstance(element || $(CHAT_INPUT)[0]),
        (n) => n.memoizedProps && n.memoizedProps.componentType != null && n.memoizedProps.value != null
      );
    } catch (_) {}

    return chatInput;
  },

  getChatInputEditor(element = null) {
    let chatInputEditor;
    try {
      chatInputEditor = searchReactParents(
        getReactInstance(element || $(CHAT_INPUT)[0]),
        (n) => n.stateNode?.state?.slateEditor != null
      );
    } catch (_) {}

    return chatInputEditor?.stateNode;
  },

  getChatInputValue() {
    const element = $(CHAT_INPUT)[0];

    // deprecated
    const {value: currentValue} = element;
    if (currentValue != null) {
      return currentValue;
    }

    const chatInput = this.getChatInput(element);
    if (chatInput == null) {
      return null;
    }

    return chatInput.memoizedProps.value;
  },

  setChatInputValue(text, shouldFocus = true) {
    const element = $(CHAT_INPUT)[0];

    // deprecated
    const {value: currentValue, selectionStart} = element;
    if (currentValue != null) {
      element.value = text;
      element.dispatchEvent(new Event('input', {bubbles: true}));

      const instance = getReactInstance(element);
      if (instance) {
        const props = instance.memoizedProps;
        if (props && props.onChange) {
          props.onChange({target: element});
        }
      }

      const selectionEnd = selectionStart + text.length;
      element.setSelectionRange(selectionEnd, selectionEnd);

      if (shouldFocus) {
        element.focus();
      }
      return;
    }

    const chatInput = this.getChatInput(element);
    if (chatInput == null) {
      return;
    }

    chatInput.memoizedProps.value = text;
    chatInput.memoizedProps.setInputValue(text);
    chatInput.memoizedProps.onValueUpdate(text);

    if (shouldFocus) {
      const chatInputEditor = this.getChatInputEditor(element);
      if (chatInputEditor != null) {
        chatInputEditor.focus();
        chatInputEditor.setSelectionRange(text.length);
      }
    }
  },

  getChatInputSelection() {
    const element = $(CHAT_INPUT)[0];

    // deprecated
    const {value: currentValue, selectionStart} = element;
    if (currentValue != null) {
      if (selectionStart === 0) {
        return SelectionTypes.START;
      }
      if (selectionStart < currentValue.length) {
        return SelectionTypes.MIDDLE;
      }
      return SelectionTypes.END;
    }

    const chatInputEditor = this.getChatInputEditor(element)?.state?.slateEditor;
    if (chatInputEditor == null || chatInputEditor.selection == null) {
      return SelectionTypes.MIDDLE;
    }

    const {focus} = chatInputEditor.selection;
    if (focus == null) {
      return SelectionTypes.MIDDLE;
    }

    const [childIndex, childPartIndex] = focus.path;
    if (childIndex === 0 && childPartIndex === 0 && focus.offset === 0) {
      return SelectionTypes.START;
    }

    const maxChildIndex = chatInputEditor.children.length - 1;
    const maxChildPartIndex = chatInputEditor.children[maxChildIndex].children.length - 1;
    const maxChildPart = chatInputEditor.children[maxChildIndex].children[maxChildPartIndex];
    const maxChildPartOffset =
      maxChildPart.children != null ? maxChildPart.children.length - 1 : (maxChildPart.text || '').length;
    if (childIndex === maxChildIndex && childPartIndex === maxChildPartIndex && focus.offset === maxChildPartOffset) {
      return SelectionTypes.END;
    }

    return SelectionTypes.MIDDLE;
  },

  getChatMessages(providerId = null) {
    let messages = Array.from($(CHAT_MESSAGE_SELECTOR))
      .reverse()
      .map((element) => ({
        element,
        message: this.getChatMessageObject(element),
        outerHTML: element.outerHTML,
      }));

    if (providerId) {
      messages = messages.filter(({message}) => message && message.user && message.user.userID === providerId);
    }

    return messages;
  },

  getCommunityHighlight() {
    let highlight;
    try {
      const node = searchReactParents(
        getReactInstance($(COMMUNITY_HIGHLIGHT)[0]),
        (n) => n.memoizedProps?.highlight?.event != null
      );
      highlight = node.memoizedProps.highlight;
    } catch (e) {}

    return highlight;
  },
};
