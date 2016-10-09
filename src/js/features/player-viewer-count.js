module.exports = function() {
    var controller = window.App && App.__container__.lookup('controller:channel');
    if (!controller || !controller.channelModel) return;

    $('div.player-livestatus').append('<span class="player-viewer-count"></span>');
    var updateViewerCount = function(model, key) {
        var label = Twitch.display.commatize(model.get(key)) + ' viewers';
        $('.player-viewer-count').text(label);
    };
    controller.channelModel.addObserver('stream.viewers', updateViewerCount);
    updateViewerCount(controller.channelModel, 'stream.viewers');
};
