// var tmi = require('./tmi'),
//     store = require('./store'),
//     helpers = require('./helpers');

// var vars = bttv.vars;

module.exports = function() {
    if (bttv.settings.get('gwEmotes') === false) {
        return [];
    }

    var usableEmotes = [];

    // var emotes = $.extend({}, store.bttvEmotes, proEmotes);

    usableEmotes.push({
        text: 'gw_test1',
        channel: 'GameWisp Channel Emotes',
        badge: 'http://bdcraft.net/community/images/smilies/aaw.png',
        url: 'http://az650423.vo.msecnd.net/emotes/emote_image_60_5ea29a53-497a-43ea-862e-f0419dfe32ba_28x28.png'
    });

    usableEmotes.push({
        text: 'gw_test2',
        channel: 'GameWisp Channel Emotes',
        badge: 'http://bdcraft.net/community/images/smilies/aaw.png',
        url: 'http://az650423.vo.msecnd.net/emotes/emote_image_60_f275c086-1d9c-45eb-824c-acb3de269a1c_28x28.png'
    });

    // console.log('usable gw emotes', usableEmotes);
    return usableEmotes;
};
