var debug = require('../helpers/debug');

module.exports = function() {
    if (!bttv.settings.get('columnToggleHotkey')) return;
    if (!window.Ember || !window.App) return;

    try {
        window.Mousetrap.bind('ctrl+left', function() {
            $('#left_close').click();
        });
        window.Mousetrap.bind('ctrl+right', function() {
            $('#right_close').click();
        });
    } catch (e) {
        debug.log('Error with column-toggle-hotkey: ', e);
    }
};
