const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div[data-reactroot]';
const CHAT_CONTAINER_CONTAINER = '.channel__sidebar';
const CHAT_CONTAINER = '.chat__container';
const CHAT_LIST = '.chat-list';
const PLAYER = '.player';

const TMIActionTypes = {
    POST: 0,
    ACTION: 1,
    BAN: 2,
    TIMEOUT: 3,
    CONNECTED: 4,
    DISCONNECTED: 5,
    RECONNECT: 6,
    HOSTING: 7,
    UNHOST: 8,
    SUBSCRIPTION: 9,
    RESUBSCRIPTION: 10,
    CLEAR: 11,
    SUBSCRIBER_ONLY_MODE: 12,
    FOLLOWER_ONLY_MODE: 13,
    SLOW_MODE: 14,
    AUTOMOD_REJECTED: 15
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

    TMIActionTypes,

    getReactElement,

    getRouter() {
        return router;
    },

    getCurrentChannel() {
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

        return rv;
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
        const container = $(CHAT_CONTAINER_CONTAINER)[0];
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

    getCurrentTMISession() {
        return this.getChatController().tmiSession;
    },

    sendChatAdminMessage(content) {
        const chatController = this.getChatController();
        if (!chatController) return;

        const data = {
            type: TMIActionTypes.POST,
            badges: {},
            bits: undefined,
            deleted: false,
            id: 'betterttv-0',
            messageParts: [{type: 0, content}],
            timestamp: Date.now(),
            user: {
                color: '#000000',
                isIntl: false,
                userID: undefined,
                userLogin: 'betterttv',
                userDisplayName: 'BetterTTV'
            }
        };

        // TODO: on render we need to style these appropriately

        chatController.chatBuffer.consumeChatEvent({data});
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
