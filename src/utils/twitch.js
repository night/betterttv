const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div';
const CHAT_CONTAINER = 'div[data-test-selector="chat-room-component-layout"]';
const VOD_CHAT_CONTAINER = '.qa-vod-chat';
const CHAT_LIST = '.chat-list';
const PLAYER = '.player';

const TMIActionTypes = {
    POST: 0,
    ACTION: 1,
    POST_WITH_MENTION: 2,
    BAN: 3,
    TIMEOUT: 4,
    AUTOMOD_REJECTED_PROMPT: 5,
    AUTOMOD_MESSAGE_REJECTED: 6,
    AUTOMOD_MESSAGE_ALLOWED: 7,
    AUTOMOD_MESSAGE_DENIED: 8,
    CONNECTED: 9,
    DISCONNECTED: 10,
    RECONNECT: 11,
    HOSTING: 12,
    UNHOST: 13,
    SUBSCRIPTION: 14,
    RESUBSCRIPTION: 15,
    SUBGIFT: 16,
    CLEAR_CHAT: 17,
    SUBSCRIBER_ONLY_MODE: 18,
    FOLLOWERS_ONLY_MODE: 19,
    SLOW_MODE: 20,
    EMOTE_ONLY_MODE: 21,
    ROOM_MODS: 22,
    ROOM_STATE: 23,
    RAID: 24,
    UNRAID: 25,
    NOTICE: 26,
    INFO: 27,
    BADGES_UPDATED: 28,
    PURCHASE: 29
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
            player = node.stateNode.player;
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
                n => n.stateNode && n.stateNode.scroll
            );
            chatScroller = node.stateNode;
        } catch (_) {}

        return chatScroller;
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
            body
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
