module.exports = function() {
    var controller = window.App && App.__container__.lookup('controller:channel');
    if (!controller || !controller.model) return;

    $('div.player-livestatus').append('<span class="player-viewer-count"></span>');
    controller.model.addObserver('stream.viewers', function(model, key) {
        var label = Twitch.display.commatize(model.get(key)) + ' viewers';
        $('.player-viewer-count').text(label);
    });
};
