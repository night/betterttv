exports.__rooms = {};
exports.__messageQueue = [];
exports.__reportedErrors = [];
exports.__subscriptions = {};
exports.__unbannedUsers = [];
exports.__channelBots = [];
exports.__twitchBadgeTypes = {};
exports.__subBadgeTypes = null;
exports.__bttvBadgeTypes = {};
exports.__bttvBadges = {};
exports.displayNames = {};
exports.trackTimeouts = {};
exports.chatters = {};
exports.tabCompleteHistory = [];
exports.suggestions = {
    matchList: [],
    lastMatch: ''
};
exports.chatHistory = [];
exports.whisperHistory = {};
exports.bttvEmotes = {};
exports.gwEmotes = {};
exports.gwRoomEmotes = {};
exports.gwRoomUsers = {};
exports.proEmotes = {};
exports.autoCompleteEmotes = {};

// as these aren't objects, they can't be local variables (otherwise we wouldn't be able to modify them from outside)
exports.currentRoom = '';
exports.activeView = true;
