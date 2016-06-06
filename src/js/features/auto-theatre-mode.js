module.exports = function() {
    if (!window.Ember || !window.App) return;

    var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
    if (routeName !== 'channel.index.index' && routeName !== 'vod') return;

    App.__container__.lookup('controller:channel').send('toggleTheatre');
};
