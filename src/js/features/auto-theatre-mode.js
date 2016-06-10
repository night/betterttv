var debug = require('../helpers/debug');

module.exports = function() {
    if (!window.Ember || !window.App) return;

    var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
    if (routeName !== 'channel.index.index' && routeName !== 'vod') return;

    try {
        App.__container__.lookup('service:layout').setTheatreMode(true);
    } catch (e) {
        debug.log('Error toggling theater mode: ', e);
    }
};
