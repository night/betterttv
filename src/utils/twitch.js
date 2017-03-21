const Raven = require('raven-js');

function formatChannel(data) {
    return {
        id: data.get('_id'),
        name: data.get('name') || data.get('id'),
        displayName: data.get('display_name'),
        game: data.get('game'),
        views: data.get('views')
    };
}

function formatUser(data) {
    return {
        id: data.id,
        name: data.login,
        displayName: data.name,
        avatar: data.logo,
        accessToken: data.chat_oauth_token
    };
}

function lookup(...args) {
    return window.App.__container__.lookup(...args);
}

let currentUser;
if (window.Twitch && window.Twitch.user) {
    window.Twitch.user()
        .then(d => formatUser(d))
        .then(u => {
            currentUser = u;
            Raven.setUserContext({
                id: u.id,
                username: u.name
            });
        });
}

module.exports = {
    getEmberContainer(...args) {
        return lookup(...args);
    },

    getEmberView(elementID) {
        return lookup('-view-registry:main')[elementID];
    },

    getCurrentChannel() {
        let rv;

        const playerService = lookup('service:persistentPlayer');
        if (!Ember.isNone(playerService) && playerService.get('playerComponent.channel.id')) {
            rv = playerService.playerComponent.channel;
        }

        if (!rv) {
            const channel = lookup('controller:channel');
            if (!Ember.isNone(channel) && channel.get('model.id')) {
                rv = channel.model;
            }
        }

        if (!rv) {
            const user = lookup('controller:user');
            if (!Ember.isNone(user) && user.get('model.id')) {
                rv = user.model;
            }
        }

        if (!rv) {
            const chat = lookup('controller:chat');
            if (!Ember.isNone(chat) && chat.get('currentChannelRoom.channel')) {
                rv = chat.get('currentChannelRoom.channel');
            }
        }

        return rv ? formatChannel(rv) : null;
    },

    getCurrentUser() {
        return currentUser;
    },

    getChatController() {
        return lookup('controller:chat');
    },

    getCurrentChat() {
        return this.getChatController().currentRoom;
    },

    getCurrentTMISession() {
        return this.getChatController().tmiSession;
    },

    sendChatAdminMessage(message) {
        this.getCurrentChat().addMessage({
            from: 'jtv',
            date: new Date(),
            style: 'admin',
            message
        });
    },

    sendChatMessage(message) {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return;
        currentChat.tmiRoom.sendMessage(message);
    },

    getCurrentUserIsModerator() {
        const currentChat = this.getCurrentChat();
        return currentChat ? currentChat.get('isModeratorOrHigher') : false;
    },

    getChatMessageObject(domElement) {
        const id = domElement.getAttribute('id');
        const view = this.getEmberView(id);
        if (!view) return null;

        let msgObject = view.msgObject;
        if (!msgObject) return null;

        if (typeof msgObject.get === 'function') {
            const newObj = {};
            ['from', 'date', 'deleted', 'color', 'labels', 'tags'].forEach(k => {
                newObj[k] = msgObject.get(k);
            });
            msgObject = newObj;
        }
        return msgObject;
    },

    getUserIsModerator(name) {
        const currentChat = this.getCurrentChat();
        if (!currentChat) return false;
        let badges = currentChat.tmiRoom.getBadges(name);
        if (!badges) return false;
        badges = Object.keys(badges);
        return badges.includes('moderator') ||
               badges.includes('broadcaster') ||
               badges.includes('global_mod') ||
               badges.includes('admin') ||
               badges.includes('staff');
    },

    getUserIsIgnored(name) {
        const tmiSession = this.getCurrentTMISession();
        return tmiSession ? tmiSession.isIgnored(name) : false;
    },

    getCurrentUserIsOwner() {
        if (!this.getCurrentChat()) return false;
        return this.getCurrentUser().id === this.getCurrentChannel().id;
    }
};
