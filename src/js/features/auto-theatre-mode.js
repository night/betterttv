var debug = require('../helpers/debug');

module.exports = function() {
    if (!bttv.settings.get('autoTheatreMode')) return;
    if (!window.Ember || !window.App) return;

    try {
        var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
        if (routeName !== 'channel.index.index' && ['videos', 'vod'].indexOf(routeName) === -1) return;
        if (App.__container__.lookup('service:persistentPlayer').playerComponent.player.theatre) return;

        window.Mousetrap.trigger('alt+t');
    } catch (e) {
        debug.log('Error toggling theater mode: ', e);
    }
};
