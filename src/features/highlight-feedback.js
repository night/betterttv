var debug = require('../debug');

var ts_tink;

module.exports = function () {
    if (bttv.settings.get('highlightFeedback') === true) {
        if (!ts_tink) {
            debug.log('loading audio feedback sound');

            ts_tink = new Audio('//cdn.betterttv.net/style/sounds/ts-tink.ogg'); // btw ogg does not work in ie
        }

        ts_tink.load(); // needed to play sound more then once
        ts_tink.play();
    };
};
