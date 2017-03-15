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

            this.emit(evt.name, evt.data);

            // TODO: REMOVE EVERYTHING BELOW THIS COMMENT
            // setTimeout( () => {this.emit('remove_emote', {emoteID: 13, emoteCode: 'GWcutecat'});}, 10000);
            // setTimeout( () => {this.emit('add_emote', {'emote': {'id': 5, 'code': 'GWsoundsgood', 'url': 'https://az650423.vo.msecnd.net/emotes/emote_image_60_99332c77-fde5-4353-8265-aac58ca0d211_28x28.png'}, 'emoteUsers': ['tbuida4', 'tbuida8']});}, 10000);
            // setTimeout( () => {this.emit('new_subscriber', {'emotes': [{'id': 6, 'code': 'gw_oreoxplays_tomato', 'url': 'https://az650423.vo.msecnd.net/emotes/emote_image_60_5ea29a53-497a-43ea-862e-f0419dfe32ba_28x28.png', 'channel': 'oreoxplays', 'twitch_channel_name': 'oreoxplays'}, {'id': 7, 'code': 'gw_oreoxplays_cc', 'url': 'https://az650423.vo.msecnd.net/emotes/emote_image_60_f275c086-1d9c-45eb-824c-acb3de269a1c_28x28.png', 'channel': 'oreoxplays', 'twitch_channel_name': 'oreoxplays'}], 'emoteIDs': [6, 7], 'user': 'tbuida8', 'channel': 'oreoxplays'});}, 10000);
            // setTimeout( () => {this.emit('cancel_subscriber', {'emoteIDs': [13, 14], 'user': 'tbuida4', 'channel': 'oreoxplays'});}, 10000);
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

        const {name} = twitch.getCurrentUser();

        this.send('join_room', {room: room, user: name});
    }
}

module.exports = new SocketClientGW();
