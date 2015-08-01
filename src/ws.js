var debug = require('./helpers/debug');
var vars = require('./vars');

var events = {};

// The rare occasion we need to global message to people
events.alert = function(data) {
    if (data.type === 'chat') {
        bttv.chat.helpers.serverMessage(data.message);
    } else if (data.type === 'growl') {
        bttv.notify(data.message.text, data.message.title, data.message.url, data.message.image, data.message.tag, data.message.permanent);
    }
};

// Night's legacy subs
events.new_subscriber = function(data) {
    if (data.channel !== bttv.getChannel()) return;

    bttv.chat.helpers.notifyMessage('subscriber', bttv.chat.helpers.lookupDisplayName(data.user) + ' just subscribed!');
    bttv.chat.store.__subscriptions[data.user] = ['night'];
    bttv.chat.helpers.reparseMessages(data.user);
};

// Nightbot emits commercial warnings to mods
events.commercial = function(data) {
    if (data.channel !== bttv.getChannel()) return;
    if (!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.login)) return;

    bttv.chat.helpers.notifyMessage('bot', data.message);
};

// Night's legacy subs
events.lookup_user = function(subscription) {
    if (!subscription.subscribed) return;

    bttv.chat.store.__subscriptions[subscription.name] = ['night'];
    if (subscription.glow) bttv.chat.store.__subscriptions[subscription.name].push('_glow');
    bttv.chat.helpers.reparseMessages(subscription.name);
};

function SocketClient() {
    this.socket = false;
    this._lookedUpUsers = [];
    this._connected = false;
    this._connectAttempts = 0;
    this._events = events;

    this.connect();
}

SocketClient.prototype.connect = function() {
    if (this._connected) return;

    debug.log('SocketClient: Connecting to Beta BetterTTV Socket Server');

    var _self = this;
    this.socket = new WebSocket('wss://sockets-beta.betterttv.net/ws');

    this.socket.onopen = function() {
        debug.log('SocketClient: Connected to Beta BetterTTV Socket Server');

        _self._connected = true;
        _self._connectAttempts = 0;
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
        } catch(e) {
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
        } catch(e) {}
    }

    delete this.socket;

    this._connected = false;

    setTimeout(function() {
        _self.connect();
    }, Math.random() * (Math.pow(2, this._connectAttempts) - 1) * 1000);
};

SocketClient.prototype.emit = function(evt, data) {
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

// Night's legacy subs
SocketClient.prototype.lookupUser = function(name) {
    if (!this._connected) return;

    if (this._lookedUpUsers.indexOf(name) > -1) return;
    this._lookedUpUsers.push(name);

    this.emit('lookup_user', { name: name });
};

SocketClient.prototype.joinChannel = function() {
    if (!this._connected) return;

    if (!bttv.getChannel().length) return;

    this.emit('join_channel', { name: bttv.getChannel() });

    // Night's legacy subs
    if (bttv.getChannel() !== 'night') return;
    var element = document.createElement('style');
    element.type = 'text/css';
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/supporter.png") !important; }';
    bttv.jQuery('.ember-chat .chat-room').append(element);
};

SocketClient.prototype.giveEmoteTip = function(channel) {
    if (!this._connected) return;

    debug.log('SocketClient: Gave an emote tip about ' + channel);
    this.emit('give_emote_tip', { name: channel });
};

module.exports = SocketClient;
