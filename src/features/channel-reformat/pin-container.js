module.exports = function() {
    if (!bttv.settings.get('pinnedHighlights')) {
        return;
    }

    // Push pin container to DOM on start if the option is enabled
    $('.ember-chat .chat-room').append($('<div id="bttv-pin-container">'));
};
