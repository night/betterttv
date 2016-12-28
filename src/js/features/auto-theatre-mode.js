var debug = require('../helpers/debug');

module.exports = function() {
    if (!window.Ember || !window.App) return;

    try {
        var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
        if (routeName !== 'channel.index.index' && routeName !== 'vod') return;

        window.Mousetrap.trigger('alt+t');

        App.__container__.lookup('service:layout').addObserver('isTheatreMode', function() {
            window.dispatchEvent(new Event('resize'));
        });
    } catch (e) {
        debug.log('Error toggling theater mode: ', e);
    }
};
