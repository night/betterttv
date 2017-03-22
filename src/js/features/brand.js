var debug = require('../helpers/debug');

module.exports = function() {
    debug.log('Branding Site with Better & Importing Styles');

    var $watermark = $('<img />');
    $watermark.attr('id', 'bttv_logo');

    // New Site Logo Branding
    if ($('#large_nav #logo').length) {
        $watermark.attr('src', 'https://cdn.betterttv.net/assets/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '10px',
            'position': 'absolute'

        });
        $('#large_nav #logo').append($watermark);
    }

    // New Twitch Friends List (lazy loads, pita)
    var lameLLT = setInterval(function() {
        if (!$('.warp .warp__logo, .top-nav__logo').length) return;

        clearInterval(lameLLT);

        $watermark.attr('src', 'https://cdn.betterttv.net/assets/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '-10px',
            'position': 'absolute'
        });
        $('.warp .warp__logo').append($watermark);

        var $newWatermark = $('<img />');
        $newWatermark.attr('id', 'bttv_logo');
        $newWatermark.attr('src', 'https://cdn.betterttv.net/assets/logos/logo_icon.png');
        $newWatermark.css({
            'z-index': 9000,
            'left': '35px',
            'top': '0px',
            'width': '12px',
            'height': 'auto',
            'position': 'absolute'
        });
        $('.top-nav__logo').append($newWatermark);

        $('.warp__drawer .warp__list .warp__item:eq(2)').before('<li class="warp__item"><a class="warp__tipsy" data-tt_medium="twitch_leftnav" href="#" title="BetterTTV Settings"><figure class="warp__avatar bttvSettingsIconDropDown"></figure><span class="drawer__item">BetterTTV Settings</span></a></li>');
        $('.top-nav-drawer__item a[data-tt_content="settings_profile"]').parent().after('<li class="top-nav-drawer__item"><a title="BetterTTV Settings" href="#" class="flex ember-view"><figure class="icon bttvSettingsIconDropDown"></figure><span class="top-nav-drawer__label">BetterTTV Settings</span></a></li>');
        $('.bttvSettingsIconDropDown').parent().click(function(e) {
            e.preventDefault();
            $('#chat_settings_dropmenu').hide();
            $('#bttvSettingsPanel').show('slow');
        });
        $('.warp__drawer .bttvSettingsIconDropDown').parent().tipsy({
            gravity: 'w'
        });
    }, 100);

    // Adds BTTV Settings Icon to Old Left Sidebar
    $('.column .content #you').append('<a class="bttvSettingsIcon" href="#""></a>');
    $('.bttvSettingsIcon').click(function(e) {
        e.preventDefault();
        $('#chat_settings_dropmenu').hide();
        $('#bttvSettingsPanel').show('slow');
    });

    // Import Global BTTV CSS Changes
    var globalCSSInject = document.createElement('link');
    globalCSSInject.setAttribute('href', 'https://cdn.betterttv.net/css/betterttv.css?' + bttv.info.versionString());
    globalCSSInject.setAttribute('type', 'text/css');
    globalCSSInject.setAttribute('rel', 'stylesheet');
    $('body').append(globalCSSInject);
};
