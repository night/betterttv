var io = require('socket.io-client');
var debug = require('./helpers/debug');
var vars = require('./vars');
var betaSocket = require('./ws')

function SocketClient() {
    this.beta = new betaSocket();
    this.socket = io('https://sockets.betterttv.net/', {
        reconnection: true,
        reconnectionDelay: 30000,
        reconnectionDelayMax: 300000
    });
    this._lookedUpUsers = [];
    this._connected = false;

    var _self = this;
    this.socket.on('connect', function () {
        debug.log("SocketClient: Connected to BetterTTV Socket Server");

        _self._connected = true;
    });

    this.socket.on('disconnect', function () {
        debug.log("SocketClient: Disconnected from BetterTTV Socket Server");

        _self._connected = false;
    });

    // The rare occasion we need to global message to people
    this.socket.on('alert', function(data) {
        if(data.type === "chat") {
            bttv.chat.helpers.serverMessage(data.message);
        } else if(data.type === "growl") {
            bttv.notify(data.message.text, data.message.title, data.message.url, data.message.image, data.message.tag, data.message.permanent);
        }
    });

    // Night's legacy subs
    this.socket.on('new_subscriber', function(data) {
        if(data.channel !== bttv.getChannel()) return;
        
        bttv.chat.helpers.notifyMessage("subscriber", bttv.chat.helpers.lookupDisplayName(data.user) + " just subscribed!");
        bttv.chat.store.__subscriptions[data.user] = ['night'];
        bttv.chat.helpers.reparseMessages(data.user);
    });

    // Nightbot emits commercial warnings to mods
    this.socket.on('commercial', function(data) {
        if(data.channel !== bttv.getChannel()) return;
        if(!vars.userData.isLoggedIn || !bttv.chat.helpers.isModerator(vars.userData.login)) return;

        bttv.chat.helpers.notifyMessage("bot", data.message);
    });
}

// Night's legacy subs
SocketClient.prototype.lookupUser = function(name) {
    this.beta.lookupUser(name);

    if(!this._connected || !this.socket.connected) return;
    if(this._lookedUpUsers.indexOf(name) > -1) return;
    this._lookedUpUsers.push(name);

    this.socket.emit('lookup_user', name, function(subscription) {
        if(!subscription) return;

        bttv.chat.store.__subscriptions[name] = ['night'];
        if(subscription.glow) bttv.chat.store.__subscriptions[name].push('_glow');
        bttv.chat.helpers.reparseMessages(name);
    });
}

SocketClient.prototype.joinChannel = function() {
    if(!this._connected || !this.socket.connected) return;
    if(!bttv.getChannel().length) return;
    
    this.socket.emit('join_channel', bttv.getChannel());

    // Night's legacy subs
    if(bttv.getChannel() !== 'night') return;
    var element = document.createElement("style");
    element.type = "text/css";
    element.innerHTML = '.badge.subscriber { background-image: url("https://cdn.betterttv.net/tags/supporter.png") !important; }';
    bttv.jQuery(".ember-chat .chat-room").append(element);
}

module.exports = SocketClient;