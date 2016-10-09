var removeElement = require('../helpers/element').remove;

module.exports = function() {
    if (bttv.settings.get('hidePrimePromotion') === true) {
        removeElement('.js-offers');
    }
};
