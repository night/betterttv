module.exports = function() {
    if (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index') {
        return;
    }

    // Call 'toggleTheatre' action on the channel controller in Ember
    App.__container__.lookup('controller:channel').send('toggleTheatre');
};
