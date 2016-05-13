var debug = require('../helpers/debug');

module.exports = function() {
    debug.log('Branding Site with Better & Importing Styles');

    var $watermark = $('<img />');
    $watermark.attr('id', 'bttv_logo');

    // New Site Logo Branding
    if ($('#large_nav #logo').length) {
        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
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
        if (!$('.warp .warp__logo').length) return;

        clearInterval(lameLLT);

        $watermark.attr('src', 'https://cdn.betterttv.net/style/logos/logo_icon.png');
        $watermark.css({
            'z-index': 9000,
            'left': '90px',
            'top': '-10px',
            'position': 'absolute'
        });
        $('.warp .warp__logo').append($watermark);

        $('.warp__drawer .warp__list .warp__item:eq(2)').before('<li class="warp__item"><a class="warp__tipsy" data-tt_medium="twitch_leftnav" href="#" title="BetterTTV Settings"><figure class="warp__avatar bttvSettingsIconDropDown"></figure><span class="drawer__item">BetterTTV Settings</span></a></li>');
        $('.bttvSettingsIconDropDown').parent().click(function(e) {
            e.preventDefault();
            $('#chat_settings_dropmenu').hide();
            $('#bttvSettingsPanel').show('slow');
        }).tipsy({
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
    globalCSSInject.setAttribute('href', 'https://cdn.betterttv.net/style/stylesheets/betterttv.css?' + bttv.info.versionString());
    globalCSSInject.setAttribute('type', 'text/css');
    globalCSSInject.setAttribute('rel', 'stylesheet');
    $('body').append(globalCSSInject);

    if (bttv.settings.get('showChatIndentation') !== false) {
        var $addCSS = $('<style></style>');
        $addCSS.attr('id', 'bttvChatIndentation');
        $addCSS.html('#chat_line_list .line p { padding-left: 16px;text-indent: -16px; }');
        $('body').append($addCSS);
    }

    // Small Popout/Embed Chat Fixes
    $('body#chat').css('overflow-y', 'hidden');
    $('#chat_loading_spinner').attr('src', 'data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7');
};
