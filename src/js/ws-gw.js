var debug = require('./helpers/debug');
var vars = require('./vars');

var events = {};

function SocketClientGW() {
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

SocketClientGW.prototype.connect = function() {
    if (this._connected || this._connecting) return;
    this._connecting = true;

    debug.log('SocketClientGW: Connecting to GameWisp Socket Server');

    var _self = this;
    this.socket = new WebSocket('wss://sockets.betterttv.net/ws');

    this.socket.onopen = function() {
        debug.log('SocketClientGW: Connected to GameWisp Socket Server');

        _self._connected = true;
        _self._connectAttempts = 1;
        _self.joinChannel();
    };

    this.socket.onerror = function() {
        debug.log('SocketClientGW: Error from GameWisp Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onclose = function() {
        if (!_self._connected || !_self.socket) return;

        debug.log('SocketClientGW: Disconnected from GameWisp Socket Server');

        _self._connectAttempts++;
        _self.reconnect();
    };

    this.socket.onmessage = function(message) {
        var evt;

        try {
            evt = JSON.parse(message.data);
        } catch (e) {
            debug.log('SocketClientGW: Error Parsing Message', e);
        }

        if (!evt || !(evt.name in _self._events)) return;

        debug.log('SocketClientGW: Received Event', evt);

        _self._events[evt.name](evt.data);
    };
};

SocketClientGW.prototype.reconnect = function() {
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

SocketClientGW.prototype.emit = function(evt, data) {
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

SocketClientGW.prototype.joinChannel = function() {
    if (!this._connected) return;

    var channel = bttv.getChannel();

    if (!channel.length) return;

    if (this._joinedChannel) {
        this.emit('part_channel', { name: this._joinedChannel });
    }

    this.emit('join_channel', { name: channel });
    this._joinedChannel = channel;
};

SocketClientGW.prototype.joinConversation = function(threadId) {
    if (this._joinedConversations.indexOf(threadId) < 0) {
        this.emit('join_channel', { name: threadId });
    }

    this.emit('broadcast_me', { name: vars.userData.name, channel: threadId });
};

module.exports = SocketClientGW;
