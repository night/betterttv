var debug = require('../helpers/debug');

module.exports = function() {
    if (bttv.settings.get('hideRecommendedStreams') !== true) return;

    debug.log('Hiding Recommended Streams');

    var recommended = $('*[data-tt_content="recommended_videos"]');

    if (recommended.length > 0) {
        var recommendedContainer = recommended[0].closest('.js-videos');
        var recommendedTitleContainer = $(recommendedContainer).parent().prev();

        $(recommendedTitleContainer).remove();
        $(recommendedContainer).remove();
    }
};
