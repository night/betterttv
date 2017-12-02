const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div[data-reactroot]';
const CHAT_CONTAINER = '.chat-room__container';
const VOD_CHAT_CONTAINER = '.video-watch-page__right-column';
const CHAT_LIST = '.chat-list';
const CHAT_INPUT = '.chat-input';
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
    CLEAR_CHAT: 16,
    SUBSCRIBER_ONLY_MODE: 17,
    FOLLOWERS_ONLY_MODE: 18,
    SLOW_MODE: 19,
    ROOM_MODS: 20,
    ROOM_STATE: 21,
    RAID: 22,
    UNRAID: 23,
    NOTICE: 24,
    INFO: 25,
    BADGES_UPDATED: 26,
    PURCHASE: 27
};

function getReactInstance(element) {
    for (const key in element) {
        if (key.startsWith('__reactInternalInstance$')) {
            return element[key];
        }
    }

    return null;
}

function getReactElement(element) {
    const instance = getReactInstance(element);
    if (!instance) return null;

    return instance._currentElement;
}

function getParentNode(reactElement) {
    try {
        return reactElement._owner._currentElement._owner;
    } catch (_) {
        return null;
    }
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

    const {_renderedChildren: children, _renderedComponent: componenet} = node;

    if (children) {
        for (const key of Object.keys(children)) {
            const childResult = searchReactChildren(children[key], predicate, maxDepth, depth + 1);
            if (childResult) {
                return childResult;
            }
        }
    }

    if (componenet) {
        return searchReactChildren(componenet, predicate, maxDepth, depth + 1);
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

    getReactElement,

    getRouter() {
        return router;
    },

    getCurrentChannel() {
        return currentChannel;
    },

    getCurrentUser() {
        return currentUser;
    },

    getConnectRoot() {
        let root;
        try {
            root = getParentNode(getReactElement($(REACT_ROOT)[0]));
        } catch (_) {}

        return root;
    },

    getCurrentPlayer() {
        let player;
        try {
            player = getReactElement($(PLAYER)[0])._owner._instance;
        } catch (_) {}

        return player;
    },

    getChatController() {
        const container = $(CHAT_CONTAINER).parent()[0];
        if (!container) return null;

        let controller = searchReactChildren(
            getReactInstance(container),
            node => node._instance && node._instance.chatBuffer
        );

        if (controller) {
            controller = controller._instance;
        }

        return controller;
    },

    getChatInputController() {
        const container = $(CHAT_INPUT)[0];
        if (!container) return null;

        let controller;
        try {
            controller = getParentNode(getReactElement(container))._instance;
        } catch (_) {}

        return controller;
    },

    getChatScroller() {
        const list = $(CHAT_LIST)[0];
        if (!list) return null;

        let scroller;
        try {
            scroller = getParentNode(getReactElement(list))._instance;
        } catch (_) {}

        return scroller;
    },

    getCurrentChat() {
        const container = $(CHAT_CONTAINER)[0];
        if (!container) return null;

        let controller;
        try {
            controller = getParentNode(getReactElement(container))._instance;
        } catch (_) {}

        return controller;
    },

    getCurrentVodChat() {
        const container = $(VOD_CHAT_CONTAINER)[0];
        if (!container) return null;

        let controller = searchReactChildren(
            getReactInstance(container),
            node => node._instance && node._instance.props && node._instance.props.data.video
        );

        if (controller) {
            controller = controller._instance;
        }

        return controller;
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
            msgObject = getReactElement(element)._owner._instance.props.message;
        } catch (_) {}
        if (!msgObject) return null;

        return msgObject;
    },

    getConversationMessageObject(element) {
        let msgObject;
        try {
            msgObject = getParentNode(getReactElement(element))._instance.props.message;
        } catch (_) {}

        return msgObject;
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
