var debug = require('../helpers/debug');

var tsTink;

module.exports = function() {
    if (bttv.settings.get('highlightFeedback') === true) {
        if (!tsTink) {
            debug.log('loading audio feedback sound');

            tsTink = new Audio('https://cdn.betterttv.net/style/sounds/ts-tink.ogg'); // btw ogg does not work in ie
        }

        tsTink.load(); // needed to play sound more then once
        tsTink.play();
    }
};
