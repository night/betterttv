var debug = require('../../debug'),
    vars = require('../../vars');

var handleResize = module.exports = function () {
    debug.log("Page resized");

    if($('body.ember-application').length === 0 || $('.ember-chat').length === 0) return;

    if(vars.chatWidth == 0) {
        $("#right_col").css({
            display: "none"
        });
        $("#right_close span").css({
            "background-position": "0 0"
        });
        $("#main_col").css({
            marginRight: '0px'
        });
    } else {
        $("#main_col").css({
            marginRight: $("#right_col").width() + 'px'
        });
    }

    if(!$('#bttvPlayerStyle').length) {
        $('<style></style>').attr('id', 'bttvPlayerStyle').appendTo('body');
    }

    var fullPlayerHeight = ($('#player object').width() * 0.5625) + 30;

    var metaAndStatsHeight = $('#broadcast-meta').outerHeight(true) + $('.stats-and-actions').outerHeight();

    var desiredPageHeight = metaAndStatsHeight + fullPlayerHeight;

    if($(window).height() > desiredPageHeight) {
        $('#bttvPlayerStyle').html('.dynamic-player, .dynamic-target-player, .dynamic-player object, .dynamic-player video, .dynamic-target-player object { width: 100% !important; height: '+fullPlayerHeight+'px !important; }');
    } else {
        var playerHeight = $(window).height() - metaAndStatsHeight;

        $('#bttvPlayerStyle').html('.dynamic-player, .dynamic-target-player, .dynamic-player object, .dynamic-player video, .dynamic-target-player object { width: 100% !important; height: '+playerHeight+'px !important; }');
    }

    if($('#hostmode').length) {
        var h = 0.5625 * $("#main_col").width() - 4;
        var calcH = $(window).height() - $(".hostmode-title-container").outerHeight(true) - $(".target-meta").outerHeight(true) - $("#hostmode .channel-actions").outerHeight(true) - $(".close-hostmode").outerHeight(true) - 33;

        if(h > calcH) {
            $('#bttvPlayerStyle').html('.dynamic-player, .dynamic-target-player, .dynamic-player object, .dynamic-player video, .dynamic-target-player object { width: 100% !important; height: '+ calcH + 'px !important; }');
        } else {
            $('#bttvPlayerStyle').html('.dynamic-player, .dynamic-target-player, .dynamic-player object, .dynamic-player video, .dynamic-target-player object { width: 100% !important; height: '+ h.toFixed(0) + 'px !important; }');
        }

        $('.target-frame').css('height',$(window).height());
    }

    $("#channel_panels_contain").masonry("reload");
};