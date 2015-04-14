var debug = require('../helpers/debug');

module.exports = function () {
    // Call 'toggleTheatre' action on the channel controller in Ember
    App.__container__.lookup('controller:channel').send('toggleTheatre');
}
