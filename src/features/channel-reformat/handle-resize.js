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

    $('#bttvPlayerStyle').html('#player, .dynamic-player, .dynamic-player object, .dynamic-player video, #hostmode .target-player object { width: 100% !important; }');

    $("#channel_panels_contain").masonry("reload");
};