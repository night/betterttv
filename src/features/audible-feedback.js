var debug = require('../helpers/debug');

var ts_tink;

module.exports = function (type) {
    if (bttv.settings.get(type + 'Feedback') === true) { // Valid types are 'highlight' and 'whisper'
        if (!ts_tink) {
            debug.log('loading audio feedback sound');

            ts_tink = new Audio('https://cdn.betterttv.net/style/sounds/ts-tink.ogg'); // btw ogg does not work in ie
        }

        ts_tink.load(); // needed to play sound more then once
        ts_tink.play();
    };
};
