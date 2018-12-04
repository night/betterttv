const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div';
const CHANNEL_CONTAINER = '.channel-page,.channel-root';
const CHAT_CONTAINER = 'section[data-test-selector="chat-room-component-layout"]';
const VOD_CHAT_CONTAINER = '.qa-vod-chat';
const CHAT_LIST = '.chat-list';
const PLAYER = '.player';
const CLIPS_BROADCASTER_INFO = '.clips-broadcaster-info';

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
    SUB_GIFT: 21,
    ANON_SUB_GIFT: 22,
    CLEAR_CHAT: 23,
    ROOM_MODS: 24,
    ROOM_STATE: 25,
    RAID: 26,
    UNRAID: 27,
    RITUAL: 28,
    NOTICE: 29,
    INFO: 30,
    BADGES_UPDATED: 31,
    PURCHASE: 32,
    BITS_CHARITY: 33,
    CRATE_GIFT: 34,
    REWARD_GIFT: 35,
    SUB_MYSTERY_GIFT: 36,
    ANON_SUB_MYSTERY_GIFT: 37
};

function getReactInstance(element) {
    for (const key in element) {
        if (key.startsWith('__reactInternalInstance$')) {
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

    const {'return': parent} = node;
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
        return searchReactChildren(child, predicate, maxDepth, depth + 1) || searchReactChildren(sibling, predicate, maxDepth, depth + 1);
    }

    return null;
}

let chatClient;
let currentUser;
let currentChannel;

module.exports = {
    setCurrentUser(accessToken, id, name, displayName) {
        twitchAPI.setAccessToken(accessToken);

        currentUser = {
            id: id.toString(),
            name,
            displayName
        };

        Raven.setUserContext({
            id: currentUser.id,
            username: currentUser.name
        });
    },

    updateCurrentChannel() {
        let rv;

        const clipsBroadcasterInfo = this.getClipsBroadcasterInfo();
        if (clipsBroadcasterInfo) {
            rv = {
                id: clipsBroadcasterInfo.id,
                name: clipsBroadcasterInfo.login,
                displayName: clipsBroadcasterInfo.displayName,
                avatar: clipsBroadcasterInfo.profileImageURL
            };
        }

        const currentChat = this.getCurrentChat();
        if (currentChat && currentChat.props && currentChat.props.channelID) {
            const {channelID, channelLogin, channelDisplayName} = currentChat.props;
            rv = {
                id: channelID.toString(),
                name: channelLogin,
                displayName: channelDisplayName
            };
        }

        const currentVodChat = this.getCurrentVodChat();
        if (currentVodChat && currentVodChat.props && currentVodChat.props.data && currentVodChat.props.data.video) {
            const {owner: {id, login}} = currentVodChat.props.data.video;
            rv = {
                id: id.toString(),
                name: login,
                displayName: login
            };
        }

        currentChannel = rv;

        return rv;
    },

    TMIActionTypes,

    getReactInstance,

    getCurrentChannel() {
        return currentChannel;
    },

    getCurrentUser() {
        return currentUser;
    },

    getConnectStore() {
        let store;
        try {
            const node = searchReactParents(
                getReactInstance($(REACT_ROOT)[0]),
                n => n.stateNode && n.stateNode.store
            );
            store = node.stateNode.store;
        } catch (_) {}

        return store;
    },

    getRouter() {
        let router;
        try {
            const node = searchReactParents(
                getReactInstance($(REACT_ROOT)[0]),
                n => n.stateNode && n.stateNode.context && n.stateNode.context.router
            );
            router = node.stateNode.context.router;
        } catch (_) {}

        return router;
    },

    getClipsBroadcasterInfo() {
        let router;
        try {
            const node = searchReactParents(
                getReactInstance($(CLIPS_BROADCASTER_INFO)[0]),
                n => n.stateNode && n.stateNode.props && n.stateNode.props.data && n.stateNode.props.data.clip
            );
            router = node.stateNode.props.data.clip.broadcaster;
        } catch (_) {}

        return router;
    },

    getCurrentPlayer() {
        let player;
        try {
            const node = searchReactParents(
                getReactInstance($(PLAYER)[0]),
                n => n.stateNode && n.stateNode.player
            );
            player = node.stateNode;
        } catch (_) {}

        return player;
    },

    getChatController() {
        let chatContentComponent;
        try {
            const node = searchReactParents(
                getReactInstance($(CHAT_CONTAINER)[0]),
                n => n.stateNode && n.stateNode.props && n.stateNode.props.messageHandlerAPI && n.stateNode.props.chatConnectionAPI

            );
            chatContentComponent = node.stateNode;
        } catch (_) {}

        return chatContentComponent;
    },

    getChannelController() {
        let channelController;
        try {
            const node = searchReactParents(
                getReactInstance($(CHANNEL_CONTAINER)[0]),
                n => n.stateNode && (n.stateNode.handleHostingChange || n.stateNode.onChatHostingChange)
            );
            channelController = node.stateNode;
        } catch (_) {}

        return channelController;
    },

    getChatServiceClient() {
        if (chatClient) return chatClient;

        try {
            const node = searchReactChildren(
                getReactInstance($(REACT_ROOT)[0]),
                n => n.stateNode && n.stateNode.join && n.stateNode.client,
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
                n => n.stateNode && n.stateNode.props && n.stateNode.props.messageBufferAPI
            );
            chatList = node.stateNode;
        } catch (_) {}

        return chatList;
    },

    getChatScroller() {
        let chatScroller;
        try {
            const node = searchReactParents(
                getReactInstance($(CHAT_LIST)[0]),
                n => n.stateNode && n.stateNode.props && n.stateNode.scroll
            );
            chatScroller = node.stateNode;
        } catch (_) {}

        return chatScroller;
    },

    getCurrentEmotes() {
        let currentEmotes;
        try {
            const node = searchReactParents(
                getReactInstance($(CHAT_CONTAINER)[0]),
                n => n.stateNode && n.stateNode.props && n.stateNode.props.emoteSetsData && n.stateNode.props.emoteSetsData.emoteMap
            );
            currentEmotes = node.stateNode.props.emoteSetsData.emoteMap;
        } catch (_) {}

        return currentEmotes;
    },

    getCurrentChat() {
        let currentChat;
        try {
            const node = searchReactParents(
                getReactInstance($(CHAT_CONTAINER)[0]),
                n => n.stateNode && n.stateNode.props && n.stateNode.props.onSendMessage
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
                n => n.stateNode && n.stateNode.props && n.stateNode.props.data && n.stateNode.props.data.video
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
            channel: `#${chatController.props.channelLogin}`
        });
    },

    sendChatMessage(message) {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return;
        currentChat.props.onSendMessage(message);
    },

    getCurrentUserIsModerator() {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return;
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
                n => n.stateNode && n.stateNode.props && n.stateNode.props.message
            );
            msgObject = node.stateNode.props.message;
        } catch (_) {}

        return msgObject;
    },

    getChatModeratorCardProps(element) {
        let apolloComponent;
        try {
            const node = searchReactParents(
                getReactInstance(element),
                n => n.stateNode && n.stateNode.props && n.stateNode.props.data
            );
            apolloComponent = node.stateNode.props;
        } catch (_) {}

        return apolloComponent;
    },

    getUserIsModeratorFromTagsBadges(badges) {
        if (!badges) return false;
        badges = Array.isArray(badges) ? badges.map(b => b.id) : Object.keys(badges);
        return badges.includes('moderator') ||
               badges.includes('broadcaster') ||
               badges.includes('global_mod') ||
               badges.includes('admin') ||
               badges.includes('staff');
    },

    getUserIsOwnerFromTagsBadges(badges) {
        if (!badges) return false;
        badges = Array.isArray(badges) ? badges.map(b => b.id) : Object.keys(badges);
        return badges.includes('broadcaster') ||
               badges.includes('global_mod') ||
               badges.includes('admin') ||
               badges.includes('staff');
    },

    getCurrentUserIsOwner() {
        if (!currentUser || !currentChannel) return false;
        return currentUser.id === currentChannel.id;
    },

    getChannelHostingContext() {
        let channelHostingContext;

        try {
            const node = searchReactChildren(
                getReactInstance($(REACT_ROOT)[0]),
                n => n.stateNode && n.stateNode.handleStreamChatRoomHostTargetChange,
                1000
            );
            channelHostingContext = node.stateNode;
        } catch (_) {}

        return channelHostingContext;
    },

    setInputValue($inputField, msg, focus = false) {
        $inputField.val(msg);
        if (focus) {
            $inputField.focus();
        }
        const inputField = $inputField[0];
        inputField.dispatchEvent(new Event('input', {bubbles: true}));
        const instance = getReactInstance(inputField);
        if (!instance) return;
        const props = instance.memoizedProps;
        if (props && props.onChange) {
            props.onChange({target: inputField});
        }
    }
};
