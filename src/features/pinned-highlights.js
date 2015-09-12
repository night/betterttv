var highlightTemplate = require('../templates/pinned-highlight');

// only pin up to 10 messages
var maximumPinCount = 10;

module.exports = function(message) {
    if (!bttv.settings.get('pinnedHighlights')) {
        return;
    }

    var $highlightContainer = $('#bttv-pin-container');

    // Format the time string
    var timeSent = message.date.getHours() + ':' + ('0' + message.date.getMinutes()).slice(-2);

    var $nextHighlight = $(highlightTemplate({ time: timeSent, displayName: message.tags['display-name'] + ':', message: message.message }));

    // Whenever the total pinned highlight count changes
    var onPinCountChange = function() {
        // Get the total height of all the currently stacked highlights
        var totalHeight = 0;

        $highlightContainer.children().each(function() {
            totalHeight += $(this).outerHeight();
        });

        // Update the height of the container
        $highlightContainer.height(totalHeight + 'px');
    };

    // If the next highlight will bump the container over the limit, remove the oldest highlight
    if ($highlightContainer.children().length + 1 > maximumPinCount) {
        $highlightContainer.children().first().remove();
    }

    // User manually closes the highlight
    $nextHighlight.children('.close').on('click', function() {
        $nextHighlight.remove();

        onPinCountChange();
    });

    // Append the highlight to the container
    $highlightContainer.append($nextHighlight);

    onPinCountChange();
};
