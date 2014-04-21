var debug = require('debug'),
	removeElement = require('element').remove;

module.exports = function () {
    debug.log("Clearing Clutter");

    // Sidebar is so cluttered
    removeElement('li[data-name="kabam"]');
    removeElement('#nav_advertisement');
    if (bttv.settings.get("showFeaturedChannels") !== true) {
        removeElement('#nav_games');
        removeElement('#nav_streams');
        removeElement('#nav_related_streams');
    }
}