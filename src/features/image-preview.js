var debug = require('../helpers/debug');

var enablePreview = exports.enablePreview = function() {
    /* CONFIG */
    var xOffset = -255,
        yOffset = 0;

    /* END CONFIG */
    $(document).on({
        mouseenter: function (e) {
            $("body").append('<iframe id="chat_preview" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" width="250px" scrolling="no" src="//api.betterttv.net/2/image_embed/'+ encodeURIComponent(this.href) +'"></iframe>');
            $("#chat_preview")
                .css("top",(e.pageY - yOffset) + "px")
                .css("left", (e.pageX - xOffset) + "px")
                .css("position", "absolute")
                .css("z-index", '100')
                .fadeIn("fast");
        }, mouseleave: function (e) {
            $("#chat_preview").remove();
        }, mousemove: function (e) {
            $("#chat_preview")
            .css("top",(e.pageY - yOffset) + "px")
            .css("left",(e.pageX + xOffset) + "px");
        }
    }, 'a.chat-preview');
};

var disablePreview = exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.chat-preview');
};
