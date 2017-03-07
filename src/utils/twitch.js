function formatChannel(data) {
    return {
        id: data._id,
        name: data.name || data.id,
        displayName: data.display_name,
        game: data.game,
        views: data.views
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

module.exports = {
    getEmberContainer(...args) {
        return lookup(...args);
    },

    getEmberView(elementID) {
        return lookup('-view-registry:main')[elementID];
    },

    getCurrentChannel() {
        let rv;
        try {
            rv = lookup('service:persistentPlayer').playerComponent.channel.content.id;
        } catch (e) {
            const channel = lookup('controller:channel');
            if (!Ember.isNone(channel) && channel.get('model.id')) {
                rv = channel.model;
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
        }

        return formatChannel(rv);
    },

    getCurrentUser() {
        return Twitch.user().then(d => formatUser(d));
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
        this.getCurrentChat().tmiRoom.sendMessage(message);
    },

    getCurrentUserIsModerator() {
        return this.getCurrentChat().get('isModeratorOrHigher');
    },

    getChatMessageObject(domElement) {
        const id = domElement.getAttribute('id');
        return this.getEmberView(id).msgObject;
    }
};
