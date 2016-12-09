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
// exports.gwEmotes = {};
exports.gwEmotes = {'gw_test1': {
    code: 'gw_test1',
    id: '1',
    imageType: 'png',
    type: 'gamewisp',
    url: 'http://az650423.vo.msecnd.net/emotes/emote_image_60_5ea29a53-497a-43ea-862e-f0419dfe32ba_28x28.png'
},
    'gw_test2': {
        code: 'gw_test2',
        id: '2',
        imageType: 'png',
        type: 'gamewisp',
        url: 'http://az650423.vo.msecnd.net/emotes/emote_image_60_f275c086-1d9c-45eb-824c-acb3de269a1c_28x28.png'
    }
};
exports.proEmotes = {};
exports.autoCompleteEmotes = {};

// as these aren't objects, they can't be local variables (otherwise we wouldn't be able to modify them from outside)
exports.currentRoom = '';
exports.activeView = true;
