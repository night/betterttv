var debug = require('../helpers/debug');

var tsTink;

exports.load = function() {
    debug.log('Loading audio feedback sound');
    tsTink = new Audio('https://cdn.betterttv.net/sounds/ts-tink.ogg'); // btw ogg does not work in ie
};

exports.play = function() {
    if (bttv.settings.get('highlightFeedback') !== true) return;

    // Reset the audio and play it
    tsTink.stop();
    tsTink.currentTime = 0;
    tsTink.play();
};
