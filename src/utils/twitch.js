const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div';
const CHANNEL_CONTAINER = '.channel-page,.channel-root';
const CHAT_CONTAINER = 'section[data-test-selector="chat-room-component-layout"]';
const VOD_CHAT_CONTAINER = '.qa-vod-chat';
const CHAT_LIST = '.chat-list';
const PLAYER = '.player';

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
    SUBGIFT: 19,
    CLEAR_CHAT: 20,
    ROOM_MODS: 21,
    ROOM_STATE: 22,
    RAID: 23,
    UNRAID: 24,
    RITUAL: 25,
    NOTICE: 26,
    INFO: 27,
    BADGES_UPDATED: 28,
    PURCHASE: 29,
    BITS_CHARITY: 30,
    CRATE_GIFT: 31,
    REWARD_GIFT: 32,
    SUB_MYSTERY_GIFT: 33
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

let currentUser;
let currentChannel;
const clipInfo = window.clipInfo;

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

        if (clipInfo) {
            rv = {
                id: clipInfo.broadcaster_id.toString(),
                name: clipInfo.broadcaster_login,
                displayName: clipInfo.broadcaster_display_name,
                avatar: clipInfo.broadcaster_logo
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
        let chatController;
        try {
            const node = searchReactParents(
                getReactInstance($(CHAT_CONTAINER)[0]),
                n => n.stateNode && n.stateNode.chatBuffer
            );
            chatController = node.stateNode;
        } catch (_) {}

        return chatController;
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
        let client;
        try {
            client = this.getChatController().chatService.client;
        } catch (_) {}
        return client;
    },

    getChatServiceSocket() {
        let socket;
        try {
            socket = this.getChatServiceClient().connection.ws;
        } catch (_) {}
        return socket;
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

        chatController.chatService.onChatNoticeEvent({
            msgid: Date.now(),
            body,
            channel: `#${chatController.chatService.channelLogin}`
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
        const currentChat = this.getCurrentChat();
        if (!currentChat) return false;
        return currentChat.props.isOwnChannel || false;
    }
};
