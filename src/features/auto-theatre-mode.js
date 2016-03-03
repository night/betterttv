module.exports = function() {
    if (!window.Ember || !window.App ||
        App.__container__.lookup('controller:application').get('currentRouteName') !== 'channel.index.index') {
        return;
    }

    var emberView = $('#player').children()[0].id;
    var emberViews = App.__container__.lookup('-view-registry:main');
    var player = window.require('web-client/components/twitch-player2').getPlayer();
    emberViews[emberView].sendAction('toggleTheatreAction', player);
};
