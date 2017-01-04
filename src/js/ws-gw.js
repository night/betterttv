var debug = require('./helpers/debug');
var vars = require('./vars');
var chat = require('./chat/store');

var events = {};

events.initialize_room = function(data) {
    console.log('data', data);

    var emote;
    var emotes = data.emotes ? data.emotes : [];

    // initialize the room emotes (holds all emotes usable by others in the chat)
    emotes.forEach(function(gwEmote) {
        if (!chat.gwRoomEmotes[gwEmote.shortcode]) {
            emote = {};
            emote.type = 'gamewisp';
            emote.imageType = 'png';
            emote.url = gwEmote.image_asset.data.content.small;
            emote.name = gwEmote.name;
            emote.code = gwEmote.shortcode;
            emote.id = gwEmote.id; // need id to match to usable emotes for each user in the room

            chat.gwRoomEmotes[gwEmote.shortcode] = emote;
        }
    });

    if (data.userStore) {
        if (!chat.gwRoomUsers) {
            chat.gwRoomUsers = data.userStore;
        } else {
            for (user in data.userStore) {
                if (!chat.gwRoomUsers[user]) {
                    chat.gwRoomUsers[user] = data.userStore[user];
                }
            }
        }
    }

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.update_room = function(data) {
    console.log('data', data);

    var newEmotes = data.emotes;

    // TODO: make sure we dont get duplicates in the datastore
    newEmotes.forEach(function(gwEmote) {
        if (!chat.gwRoomEmotes[gwEmote.shortcode]) {
            emote = {};
            emote.type = 'gamewisp';
            emote.imageType = 'png';
            emote.url = gwEmote.image_asset.data.content.small;
            emote.name = gwEmote.name;
            emote.code = gwEmote.shortcode;
            emote.id = gwEmote.id; // need id to match to usable emotes for each user in the room

            chat.gwRoomEmotes[gwEmote.shortcode] = emote;
        }
    });

    var newUser = data.user;

    if (!chat.gwRoomUsers[newUser.name]) {
        chat.gwRoomUsers[newUser.name] = newUser.emoteIDs;
    }
};

function SocketClientGW() {
    this.socket = false;
    this._connected = false;
    this._connecting = false;
    this._connectAttempts = 1;
    this._joinedChannel = null;
    this._joinedConversations = [];
    this._events = events;

    if (bttv.settings.get('gwEmotes')) {
        this.connect();
    }
}

SocketClientGW.prototype.connect = function() {
    if (this._connected || this._connecting) return;
    this._connecting = true;

    debug.log('SocketClientGW: Connecting to GameWisp Socket Server');

    var _self = this;
    var socketURL = 'ws://localhost:3000/' + bttv.getChannel();
    this.socket = new WebSocket(socketURL);


    this.socket.onopen = function() {
        debug.log('SocketClientGW: Connected to GameWisp Socket Server');

        _self._connected = true;
        _self._connectAttempts = 1;
        _self.joinRoom();
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
        // debug.log('message', message);
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
    debug.log('emitting evt', evt);
    debug.log('emitting data', data);
    if (!this._connected || !this.socket) return;

    this.socket.send(JSON.stringify({
        name: evt,
        data: data
    }));
};

SocketClientGW.prototype.joinRoom = function() {
    if (!this._connected) return;

    var channel = bttv.getChannel();

    if (!channel.length) return;
    if (!vars.userData) return;

    this.emit('join_room', { room: channel, user: vars.userData.name });
    this._joinedRoom = channel;
};

module.exports = SocketClientGW;
