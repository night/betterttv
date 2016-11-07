module.exports = function() {
    if (!window.Ember || !window.App) return;
    var routeName = App.__container__.lookup('controller:application').get('currentRouteName');
    if (routeName.substr(0, 8) !== 'channel.') return;

    var $subButton = $('.js-subscribe-button-dynamic').parent();
    if ($subButton.length === 0) return;

    var subButton = App.__container__.lookup('-view-registry:main')[$subButton.attr('id')];
    if (!subButton || !subButton.context) return;

    var toggleSubCreditIcon = function() {
        $('.bttv-free-sub-reminder').remove();
        var $arrow = $subButton.find('.button .arrow');
        if (subButton.context.hasSubCredit) {
            $arrow.hide();
            $arrow.after('<span class="bttv-free-sub-reminder"/>');
        } else {
            $arrow.show();
        }
    };

    toggleSubCreditIcon();
    subButton.context.addObserver('hasSubCredit', toggleSubCreditIcon);
};
