var debug = require('../../debug'),
    vars = require('../../vars');

var handleResize = module.exports = function () {
    debug.log("Page resized");

    if($('body.ember-application').length === 0 || $('.ember-chat').length === 0) return;

    var d = 0;
    if ($("#large_nav").css("display") !== "none") {
        d += $("#large_nav").width();
    }
    if ($("#small_nav").css("display") !== "none") {
        d += $("#small_nav").width();
    }
    if (vars.chatWidth == 0) {
        $("#right_col").css({
            display: "none"
        });
        $("#right_close span").css({
            "background-position": "0 0"
        });
    }
    if ($("#right_col").css("display") !== "none") {
        if ($("#right_col").width() < 340) {
            vars.chatWidth = 340;
            $("#right_col").width(vars.chatWidth);
            $("#right_col #chat").width(vars.chatWidth);
            $("#right_col .top").width(vars.chatWidth);
            $("#right_col").css("display", "inherit");
            $("#right_close span").css({
                "background-position": "0 -18px"
            });
            handleResize();
            return;
        } else {
            d += $("#right_col").width();
        }
    }

    $("#main_col").css({
        width: $(window).width() - d + "px"
    });

    if(!$('#bttvPlayerStyle').length) {
        $('<style></style>').attr('id', 'bttvPlayerStyle').appendTo('body');
    }
    var h = 0.5625 * $("#main_col").width() - 4;
    var calcH = $(window).height() - $("#broadcast-meta").outerHeight(true) - $(".stats-and-actions").outerHeight();
    if (h > calcH) {
        $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video { width: 100% !important; height: '+ ($(window).height() - $(".stats-and-actions").outerHeight()) + 'px !important; }');
        
        if(!$('#hostmode').length && $("#main_col .tse-scroll-content").scrollTop() === 0) {
            $("#main_col .tse-scroll-content").animate({
                scrollTop: $("#broadcast-meta").outerHeight(true) - 10
            }, 150, "swing");
        }
    } else {
        $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video { width: 100% !important; height: '+ h.toFixed(0) + 'px !important; }');
    }
    $('#bttvPlayerStyle').append('#hostmode .target-player, #hostmode .target-player object, #hostmode .target-player video { width: 100% !important; }');

    var d = $("#broadcast-meta .info .title").width();
    $("#broadcast-meta .info .title .real_title").width() > d ? $("#broadcast-meta .info").addClass("long_title") : $("#broadcast-meta .info").removeClass("long_title");
    $("#channel_panels_contain").masonry("reload");
};