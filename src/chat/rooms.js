var tmi = require('./tmi'),
    store = require('./store');

var getRooms = exports.getRooms = function() {
    return Object.keys(store.__rooms);
};
var getRoom = exports.getRoom = function(name) {
    if(!store.__rooms[name]) {
        var handlers = require('./handlers');
        newRoom(name);
        if(tmi().tmiRoom) {
            delete tmi().tmiRoom._events['message'];
            delete tmi().tmiRoom._events['clearchat'];
            tmi().tmiRoom.on('message', getRoom(name).chatHandler);
            tmi().tmiRoom.on('clearchat', handlers.clearChat);
        }
    }
    return store.__rooms[name];
};
var newRoom = exports.newRoom = function(name) {
    var handlers = require('./handlers');
    var emberRoom = null;
    var groupRooms = bttv.getChatController().get('connectedPrivateGroupRooms');
    var channelRoom = bttv.getChatController().get('currentChannelRoom');
    
    if(channelRoom.get('id') === name) {
        emberRoom = channelRoom;
    } else {
        for(var i=0; i<groupRooms.length; i++) {
            if(groupRooms[i].get('id') === name) {
                emberRoom = groupRooms[i];
                break;
            }
        }
    }
    store.__rooms[name] = {
        name: name,
        unread: 0,
        emberRoom: emberRoom,
        active: function() { return (bttv.getChatController() && bttv.getChatController().currentRoom && bttv.getChatController().currentRoom.get('id') === name) ? true : false; },
        messages: [],
        playQueue: function() {
            store.__rooms[name].unread = 0;
            handlers.countUnreadMessages();
            for(var i=0; i<store.__rooms[name].messages.length; i++) {
                var message = store.__rooms[name].messages[i];
                handlers.onPrivmsg(name, message);
            }
        },
        queueMessage: function(message) {
            if(store.__rooms[name].messages.length > bttv.settings.get("scrollbackAmount")) {
                store.__rooms[name].messages.shift();
            }
            store.__rooms[name].messages.push(message);
        },
        chatHandler: function(data) {
            if(data.from && data.from !== 'jtv') getRoom(name).queueMessage(data);

            if(getRoom(name).active()) {
                handlers.onPrivmsg(name, data);
            } else {
                store.__rooms[name].unread++;
                handlers.countUnreadMessages();
            }
        }
    }
};