const SafeEventEmitter = require('./utils/safe-event-emitter');
const debug = require('./utils/debug');
const twitch = require('./utils/twitch');
const throttle = require('lodash.throttle');

const CONNECTION_STATES = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2
};

const WEBSOCKET_ENDPOINT = 'wss://sockets.betterttv.net/ws';

let socket;
let state = CONNECTION_STATES.DISCONNECTED;
let attempts = 1;

const joinedChannels = [];

class SocketClient extends SafeEventEmitter {
    constructor() {
        super();

        this.connect();

        this.broadcastMe = throttle(this.broadcastMe.bind(this), 1000, {trailing: false});
    }

    connect() {
        if (state !== CONNECTION_STATES.DISCONNECTED) return;
        state = CONNECTION_STATES.CONNECTING;

        debug.log('SocketClient: Connecting to server');

        socket = new WebSocket(WEBSOCKET_ENDPOINT);

        socket.onopen = () => {
            debug.log('SocketClient: Connected to server');

            state = CONNECTION_STATES.CONNECTED;
            attempts = 1;

            if (joinedChannels.length) {
                joinedChannels.forEach(c => this.joinChannel(c));
            }
        };

        socket.onerror = socket.onclose = () => {
            if (state === CONNECTION_STATES.DISCONNECTED) return;

            debug.log('SocketClient: Disconnected from server');

            attempts++;
            this.reconnect();
        };

        socket.onmessage = ({data}) => {
            let evt;

            try {
                evt = JSON.parse(data);
            } catch (e) {
                debug.log('SocketClient: Error parsing message', e);
                return;
            }

            debug.log('SocketClient: Received event', evt);

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

    send(name, data) {
        if (state !== CONNECTION_STATES.CONNECTED) return;

        socket.send(JSON.stringify({
            name,
            data
        }));
    }

    joinChannel(name) {
        if (!joinedChannels.includes(name)) {
            joinedChannels.push(name);
        }
        this.send('join_channel', {name});
        this.broadcastMe(name);
    }

    partChannel(name) {
        if (!joinedChannels.includes(name)) return;
        joinedChannels.splice(joinedChannels.indexOf(name), 1);
        this.send('part_channel', {name});
    }

    broadcastMe(channelName, name) {
        const currentUser = twitch.getCurrentUser();
        if (!currentUser) return;
        this.send('broadcast_me', {name: name || currentUser.name, channel: channelName});
    }
}

module.exports = new SocketClient();
