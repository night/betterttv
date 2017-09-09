const $ = require('jquery');
const Raven = require('raven-js');
const twitchAPI = require('./twitch-api');

const REACT_ROOT = '#root div[data-reactroot]';
const CHAT_CONTAINER = '.chat__container';
const CHAT_LINES = '.chat-list__lines';

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

function getParentElement(reactElement) {
    try {
        return getParentNode(reactElement)._currentElement;
    } catch (_) {
        return null;
    }
}

function formatChannel(data) {
    return {
        id: (data.broadcaster_id || data.props.channelID).toString(),
        name: data.broadcaster_login || data.props.channelName
    };
}

function formatUser(data) {
    return {
        id: data._id.toString(),
        name: data.name,
        displayName: data.display_name,
        avatar: data.logo
    };
}

function lookup(...args) {
    return window.App ? window.App.__container__.lookup(...args) : null;
}

let currentUser;
let router;

try {
    const connectRoot = getParentNode(getReactElement($(REACT_ROOT)[0]));
    const context = connectRoot._context;
    router = context.router;
    twitchAPI.setAccessToken(context.store.getState().session.authToken);
    twitchAPI.get('user', {auth: true}).then(user => {
        currentUser = formatUser(user);

        Raven.setUserContext({
            id: currentUser.id,
            username: currentUser.name
        });
    });
} catch (_) {}

const clipInfo = window.clipInfo;

module.exports = {
    TMIActionTypes,

    getReactElement,

    getRouter() {
        return router;
    },

    getEmberContainer(...args) {
        return lookup(...args);
    },

    getEmberView(elementID) {
        const obj = lookup('-view-registry:main');
        return obj ? obj[elementID] : null;
    },

    getCurrentChannel() {
        let rv;

        if (clipInfo) {
            rv = clipInfo;
        }

        const currentChat = this.getCurrentChat();
        if (currentChat) {
            rv = currentChat;
        }

        return rv ? formatChannel(rv) : null;
    },

    getCurrentUser() {
        return currentUser;
    },

    getChatController() {
        const container = $(CHAT_CONTAINER)[0];
        if (!container) return null;

        let controller;
        try {
            controller = getParentNode(getParentElement(getReactElement(container)))._instance;
        } catch (_) {}

        return controller;
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
                name: 'betterttv',
                usernameDisplay: 'BetterTTV'
            }
        };

        // TODO: on render we need to style these appropriately

        chatController.chatBuffer.consumeChatEvent({data});
    },

    sendChatMessage(message) {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return;
        currentChat.send(message);
    },

    getCurrentUserIsModerator() {
        // TODO: twitch does not support this yet
        return false;
    },

    getChatMessageObject(element) {
        // it doesn't seem possible to get the data we need
        // from the message itself, so we need to associate from the message
        // its object in the chat lines children
        const chatLines = getReactElement($(CHAT_LINES)[0]);
        if (!chatLines) return null;

        let badgesToRender;
        try {
            badgesToRender = getReactElement(element).props.children[1].props.badgesToRender;
        } catch (_) {}
        if (!badgesToRender) return null;

        const children = chatLines.props.children;
        let msgObject;
        for (let i = children.length - 1; i >= 0; i--) {
            const child = children[i];
            // this is a hack if i've ever seen one.. but they share the same ref
            if (child.props.message.badges === badgesToRender) {
                msgObject = child;
                break;
            }
        }
        if (!msgObject) return null;

        return msgObject.props.message;
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
        return currentChat.isOwnChannel || false;
    }
};
