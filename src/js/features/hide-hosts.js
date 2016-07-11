var debug = require('../helpers/debug');

module.exports = function() {
    if (bttv.settings.get('hideHostedStreams') !== true) return;

    debug.log('Hiding hosted');

    var hosted = $('*[data-tt_content="live_host"]');
    if (hosted.length > 0) {
        var hostedContainer = hosted[0].closest('.js-streams');
        var hostedTitleContainer = $(hostedContainer).prev();

        $(hostedTitleContainer).remove();
        $(hostedContainer).remove();
    } else {
        var emptyGrid = $('.empty-grid');
        if (emptyGrid.length > 0) {
            $(emptyGrid).prev().remove();
            $(emptyGrid).prev().remove();
            $(emptyGrid).remove();
        }
    }
};
