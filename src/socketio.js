var io = require('socket.io-client');
var debug = require('./helpers/debug');
var vars = require('./vars');

function SocketClient() {
    this.socket = io('//sockets.betterttv.net/', {
        reconnection: true,
        reconnectionDelay: 30000,
        reconnectionDelayMax: 300000
    });
    this.lookedUpUsers = [];

    var _self = this;
    this.socket.on('connect', function () {
        debug.log("SocketClient: Connected to BetterTTV Socket Server");

        _self.joinChannel();
    });

    this.socket.on('disconnect', function () {
        debug.log("SocketClient: Disconnected from BetterTTV Socket Server");
    });

    // The rare occasion we need to global message people
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

SocketClient.prototype.chatHistory = function(callback) {
    if(!this.socket.connected) callback([]);

    this.socket.emit('chat_history', bttv.getChannel(), function(history) {
        callback(history);
    });
}

// Night's legacy subs
SocketClient.prototype.lookupUser = function(name) {
    if(!this.socket.connected) return;
    if(this.lookedUpUsers.indexOf(name) > -1) return;
    this.lookedUpUsers.push(name);

    this.socket.emit('lookup_user', name, function(subscription) {
        if(!subscription) return;

        bttv.chat.store.__subscriptions[name] = ['night'];
        if(subscription.glow) bttv.chat.store.__subscriptions[name].push('_glow');
        bttv.chat.helpers.reparseMessages(name);
    });
}

SocketClient.prototype.joinChannel = function() {
    if(!bttv.getChannel().length) return;
    
    this.socket.emit('join_channel', bttv.getChannel());

    // Night's legacy subs
    if(bttv.getChannel() !== 'night') return;
    var element = document.createElement("style");
    element.type = "text/css";
    element.innerHTML = '.badge.subscriber { background-image: url("//cdn.betterttv.net/tags/supporter.png") !important; }';
    bttv.jQuery(".ember-chat .chat-room").append(element);
}

SocketClient.prototype.giveEmoteTip = function(channel) {
    this.socket.emit('give_emote_tip', channel, function(status) {
        debug.log("SocketClient: Gave an emote tip about " + channel + " (success: " + status + ")");
    });
}

module.exports = SocketClient;