var tmi = require('./tmi');

exports.__rooms = {};
exports.__messageQueue = [];
exports.__reportedErrors = [];
exports.__subscriptions = {};
exports.__unbannedUsers = [];
exports.displayNames = {};
exports.trackTimeouts = {};
exports.chatters = {};
exports.suggestions = {
    matchList: [],
    lastMatch: '',
},
exports.chatHistory = [];
exports.bttvEmotes = {};
exports.autoCompleteEmotes = {};

// as these aren't objects, they can't be local variables (otherwise we wouldn't be able to modify them from outside)
exports.__messageTimer = false;
exports.__usersBeingLookedUp = 0;
exports.currentRoom = '';
exports.activeView = true;