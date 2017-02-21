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
        avatar: data.logo
    };
}

function lookup(...args) {
    return window.App.__container__.lookup(...args);
}

module.exports = {
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
        }

        return formatChannel(rv);
    },

    getCurrentUser() {
        return Twitch.user().then(d => formatUser(d));
    },

    getCurrentTMISession() {
        return lookup('controller:chat').tmiSession;
    },

    sendChatAdminMessage(message) {
        lookup('controller:chat').currentRoom.addMessage({
            from: 'jtv',
            date: new Date(),
            style: 'admin',
            message
        });
    }
};
