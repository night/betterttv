var debug = require('./helpers/debug');
var vars = require('./vars');
var chat = require('./chat/store');
var msgpack = require('msgpack-lite');

var events = {};

events.initialize_room = function(data) {
    var emotes = data.emotes ? data.emotes : [];

    // initialize the room emotes (holds all emotes usable by others in the chat)
    emotes.forEach(function(gwEmote) {
        if (!chat.gwRoomEmotes[gwEmote.code]) {
            gwEmote.type = 'gamewisp';
            gwEmote.imageType = 'png';

            chat.gwRoomEmotes[gwEmote.code] = gwEmote;
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
    var newEmotes = data.emotes,
        newUser = data.user;

    // add the emotes
    newEmotes.forEach(function(gwEmote) {
        if (!chat.gwRoomEmotes[gwEmote.code]) {
            gwEmote.type = 'gamewisp';
            gwEmote.imageType = 'png';

            chat.gwRoomEmotes[gwEmote.code] = gwEmote;
        }
    });

    // add the user
    chat.gwRoomUsers[newUser.name] = newUser.emoteIDs;

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.leave_room = function(data) {
    var username = data.user;

    if (chat.gwRoomUsers[username]) {
        delete chat.gwRoomUsers[username];
    }

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.remove_emote = function(data) {
    console.log('remove emote data', data);

    var emoteID = parseInt(data.emoteID, 10),
        code = data.emoteCode;

    // delete the emote from the room emotes store
    if (chat.gwRoomEmotes[code] && chat.gwRoomEmotes[code].id === emoteID) {
        // chat.gwRoomEmotes[code].url = null;
        delete chat.gwRoomEmotes[code];
    }

    // delete the emote from main gw emotes store
    if (chat.gwEmotes[code]) {
        delete chat.gwEmotes[code];
    }

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.add_emote = function(data) {
    console.log('add emote data', data);

    // add the emote
    var emote = data.emote;
    emote.type = 'gamewisp';
    emote.imageType = 'png';

    if (!chat.gwRoomEmotes[emote.code]) {
        chat.gwRoomEmotes[emote.code] = emote;
    }

    // add the emote id to all of the users
    data.emoteUsers.forEach(function(user) {
        if (!chat.gwRoomUsers[user]) {
            chat.gwRoomUsers[user] = [];
        }

        var usableEmoteIDs = chat.gwRoomUsers[user];

        if (usableEmoteIDs.indexOf(emote.id) === -1) {
            usableEmoteIDs.push(emote.id);
        }

        // add to gwEmotes store if user is same as vars.userData.name
        if (vars.userData && user === vars.userData.name) {
            if (!chat.gwEmotes[emote.code]) {
                chat.gwEmotes[emote.code] = emote;
            }
        }
    });

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.new_subscriber = function(data) {
    console.log('new subscriber data', data);

    if (!data.emotes) return;

    if (!chat.gwRoomUsers[data.user]) {
        chat.gwRoomUsers[data.user] = [];
    }

    var usableEmoteIDs = chat.gwRoomUsers[data.user];

    data.emotes.forEach(function(emote) {
        emote.type = 'gamewisp';
        emote.imageType = 'png';

        // add to the user's available emote ids array
        if (usableEmoteIDs.indexOf(emote.id) === -1) {
            usableEmoteIDs.push(emote.id);
        }

        // add to the gwRoomEmotes
        if (!chat.gwRoomEmotes[emote.code]) {
            chat.gwRoomEmotes[emote.code] = emote;
        }

        // add to gwEmotes store if user is same as new sub
        if (vars.userData && vars.userData.name === data.user) {
            chat.gwEmotes[emote.code] = emote;
        }
    });

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

events.cancel_subscriber = function(data) {
    // remove emote ids that the user can no longer use since their subscription was cancelled
    console.log('cancel subscriber data', data);

    if (!chat.gwRoomUsers[data.user]) return;

    var emoteIDsToRemove = data.emoteIDs,
        usableEmoteIDs = chat.gwRoomUsers[data.user],
        emote,
        idx;

    emoteIDsToRemove.forEach(function(emoteID) {
        idx = usableEmoteIDs.indexOf(emoteID);

        if (idx >= 0) {
            usableEmoteIDs.splice(idx, 1);
        }
    });

    // remove from gwEmotes store if user is same as cancelled sub
    if (vars.userData && vars.userData.name === data.user) {
        for (var code in chat.gwEmotes) {
            if (Object.hasOwnProperty.call(chat.gwEmotes, code)) {
                emote = chat.gwEmotes[code];

                if (
                    emote &&
                    Object.hasOwnProperty.call(emote, 'id') &&
                    emoteIDsToRemove.indexOf(emote.id) !== -1
                ) {
                    delete chat.gwEmotes[code];
                }
            }
        }
    }

    console.log('gwRoomEmotes', chat.gwRoomEmotes);
    console.log('gwRoomUsers', chat.gwRoomUsers);
};

function SocketClientGW() {
    this.socket = false;
    this._connected = false;
    this._connecting = false;
    this._connectAttempts = 1;
    this._joinedRoom = null;
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

    if (!bttv.getChannel() || !vars.userData.name) return;

    var socketURL = 'wss://emotes.gamewisp.com/';

    this.socket = new WebSocket(socketURL);
    this.socket.binaryType = 'arraybuffer';

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
        debug.log('message', message);
        var evt;

        try {
            evt = msgpack.decode(new Uint8Array(message.data));
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
