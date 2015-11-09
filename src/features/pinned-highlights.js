var highlightTemplate = require('../templates/pinned-highlight');

// only pin up to 10 messages
var maximumPinCount = 10;

module.exports = function(message) {
    if (!bttv.settings.get('pinnedHighlights')) return;

    var $highlightContainer = $('#bttv-pin-container');

    // Push pin container to DOM if it doesn't exist
    if (!$highlightContainer.length) {
        $highlightContainer = $('<div id="bttv-pin-container">').appendTo($('.ember-chat .chat-room'));
    }

    var timeSent = message.date.toLocaleTimeString().replace(/^(\d{0,2}):(\d{0,2}):(.*)$/i, '$1:$2');

    var $nextHighlight = $(highlightTemplate({ time: timeSent, displayName: message.tags['display-name'] || message.from, message: message.message }));

    // If the next highlight will bump the container over the limit, remove the oldest highlight
    if ($highlightContainer.children().length + 1 > maximumPinCount) {
        $highlightContainer.children().first().remove();
    }

    // User manually closes the highlight
    $nextHighlight.children('.close').on('click', function() {
        $nextHighlight.remove();
    });

    // Append the highlight to the container
    $highlightContainer.append($nextHighlight);
};
