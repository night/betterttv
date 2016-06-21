var debug = require('./helpers/debug');
var vars = require('./vars');

var events = {};

// The rare occasion we need to global message to people
events.alert = function(data) {
    if (data.type === 'chat') {
        bttv.chat.helpers.serverMessage(data.message);
    } else if (data.type === 'growl') {
        bttv.notify(data.message.text, {
            title: data.message.title,
            url: data.message.url,
            image: data.message.image,
            tag: data.message.tag,
            permanent: data.message.permanent
        });
    }
};

// Night's legacy subs
events.new_subscriber = function(data) {
    if (data.channel !== bttv.getChannel()) return;

    bttv.chat.helpers.notifyMessage('subscriber', bttv.chat.helpers.lookupDisplayName(data.user) + ' just subscribed!');
    bttv.chat.store.__subscriptions[data.user] = ['night'];
    bttv.chat.helpers.reparseMessages(data.user);
};

// Chat Spammers
events.new_spammer = function(data) {
    bttv.chat.store.spammers.push(data.name);
};

// Nightbot emits commercial warnings to mods
events.commercial = function(data) {
    if (data.channel !== bttv.getChannel()) return;
    if (!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.name)) return;

    bttv.chat.helpers.notifyMessage('bot', data.message);
};

// Night's legacy subs & BetterTTV Pro
events.lookup_user = function(subscription) {
    if (!subscription.pro && !subscription.subscribed) return;

    if (subscription.pro && subscription.emotes) {
        bttv.chat.store.proEmotes[subscription.name] = {};

        subscription.emotes.forEach(function(emote) {
            emote.type = 'personal';
            bttv.chat.store.proEmotes[subscription.name][emote.code] = emote;
        });
    }

    if (subscription.subscribed) {
        bttv.chat.store.__subscriptions[subscription.name] = ['night'];
        if (subscription.glow) bttv.chat.store.__subscriptions[subscription.name].push('_glow');
    }

    bttv.chat.helpers.reparseMessages(subscription.name);
};

function SocketClient() {
    this.socket = false;
    this._lookedUpUsers = [];
    this._connected = false;
    this._connecting = false;
    this._connectAttempts = 1;
    this._joinedChannel = null;
    this._joinedConversations = [];
    this._events = events;

    this.connect();
}

SocketClient.prototype.connect = function() {
    if (this._connected || this._connecting) return;
    this._connecting = true;

    debug.log('SocketClient: Connecting to Beta BetterTTV Socket Server');

    var _self = this;
    this.socket = new WebSocket('wss://sockets.betterttv.net/ws');

    this.socket.onopen = function() {
        debug.log('SocketClient: Connected to Beta BetterTTV Socket Server');

        _self._connected = true;
        _self._connectAttempts = 1;
        _self.joinChannel();
    };

    this.socket.onerror = function() {
        debug.log('SocketClient: Error from Beta BetterTTV Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onclose = function() {
        if (!_self._connected || !_self.socket) return;

        debug.log('SocketClient: Disconnected from Beta BetterTTV Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onmessage = function(message) {
        var evt;

        try {
            evt = JSON.parse(message.data);
        } catch (e) {
            debug.log('SocketClient: Error Parsing Message', e);
        }

        if (!evt || !(evt.name in _self._events)) return;

        debug.log('SocketClient: Received Event', evt);

        _self._events[evt.name](evt.data);
    };
};

SocketClient.prototype.reconnect = function() {
    var _self = this;

    if (this.socket) {
        try {
            this.socket.close();
        } catch (e) {}
    }

    delete this.socket;

    this._connected = false;

    if (this._connecting === false) return;
    this._connecting = false;

    setTimeout(function() {
        _self.connect();
    }, Math.random() * (Math.pow(2, this._connectAttempts) - 1) * 30000);
};

SocketClient.prototype.emit = function(evt, data) {
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

// Night's legacy subs
SocketClient.prototype.broadcastMe = function() {
    if (!this._connected || !vars.userData.isLoggedIn) return;

    this.emit('broadcast_me', { name: vars.userData.name, channel: bttv.getChannel() });
};

SocketClient.prototype.joinChannel = function() {
    if (!this._connected) return;

    var channel = bttv.getChannel();

    if (!channel.length) return;

    if (this._joinedChannel) {
        this.emit('part_channel', { name: this._joinedChannel });
    }

    this.emit('join_channel', { name: channel });
    this._joinedChannel = channel;

    // Night's legacy subs
    if (channel !== 'night') return;
    var element = document.createElement('style');
    element.type = 'text/css';
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/subscriber.png") !important; }';
    bttv.jQuery('.ember-chat .chat-room').append(element);
};

SocketClient.prototype.joinConversation = function(threadId) {
    if (this._joinedConversations.indexOf(threadId) < 0) {
        this.emit('join_channel', { name: threadId });
    }

    this.emit('broadcast_me', { name: vars.userData.name, channel: threadId });
};

module.exports = SocketClient;
