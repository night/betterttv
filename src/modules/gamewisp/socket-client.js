const SafeEventEmitter = require('../../utils/safe-event-emitter');
const debug = require('../../utils/debug');
const twitch = require('../../utils/twitch');
const msgpack = require('msgpack-lite');
const settings = require('../../settings');

const CONNECTION_STATES = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2
};

const WEBSOCKET_ENDPOINT = 'wss://emotes.gamewisp.com/';

let socket;
let state = CONNECTION_STATES.DISCONNECTED;
let attempts = 1;

const joinedChannels = [];

class SocketClientGW extends SafeEventEmitter {
    constructor() {
        super();

        if (settings.get('gwEmotes')) {
            this.connect();
        }

        settings.on('changed.gwEmotes', () => {
            if (settings.get('gwEmotes')) {
                this.connect();
            } else {
                this.disconnect();
            }
        });
    }

    connect() {
        if (state !== CONNECTION_STATES.DISCONNECTED) return;
        state = CONNECTION_STATES.CONNECTING;

        debug.log('SocketClientGW: Connecting to server');

        socket = new WebSocket(WEBSOCKET_ENDPOINT);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
            debug.log('SocketClientGW: Connected to server');

            state = CONNECTION_STATES.CONNECTED;
            attempts = 1;

            if (joinedChannels.length) {
                joinedChannels.forEach(c => this.joinRoom(c));
            }
        };

        socket.onerror = socket.onclose = () => {
            if (state === CONNECTION_STATES.DISCONNECTED) return;

            debug.log('SocketClientGW: Disconnected from server');

            attempts++;
            this.reconnect();
        };

        socket.onmessage = message => {
            let evt;

            try {
                evt = msgpack.decode(new Uint8Array(message.data));
            } catch (e) {
                debug.log('SocketClientGW: Error parsing message', e);
                return;
            }

            debug.log('SocketClientGW: Received event', evt);

            // ignore unhandled error events
            if (evt.name === 'error') return;

            this.emit(evt.name, evt.data);
        };
    }

    reconnect() {
        if (state === CONNECTION_STATES.CONNECTING) return;
        state = CONNECTION_STATES.DISCONNECTED;

        if (socket) {
            try {
                socket.close();
            } catch (e) {}

            socket = null;
        }

        setTimeout(
            () => this.connect(),
            Math.random() * (Math.pow(2, attempts) - 1) * 30000
        );
    }

    disconnect() {
        state = CONNECTION_STATES.DISCONNECTED;
        if (socket) {
            try {
                socket.close();
            } catch (e) {}

            socket = null;
        }
    }

    send(name, data) {
        if (state !== CONNECTION_STATES.CONNECTED) return;

        socket.send(JSON.stringify({
            name: name,
            data: data
        }));
    }

    joinRoom(room) {
        if (!joinedChannels.includes(room)) {
            joinedChannels.push(room);
        }

        const currentUser = twitch.getCurrentUser();
        if (!currentUser) return;

        this.send('join_room', {room, user: currentUser.name});
    }
}

module.exports = new SocketClientGW();
