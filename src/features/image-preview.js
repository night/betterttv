var debug = require('../helpers/debug');

var enablePreview = exports.enablePreview = function() {
    /* CONFIG */
    var xOffset = -250,
        yOffset = 0;

    /* END CONFIG */
    $(document).on({
        mouseenter: function (e) {
            $("body").append("<p id='preview'><img height=\"200px\" src='"+ this.href +"' alt='Image preview' /></p>");
            $("#preview")
                .css("top",(e.pageY - yOffset) + "px")
                .css("left", (e.pageX - xOffset) + "px")
                .css("position", "absolute")
                .css("z-index", '100')
                .fadeIn("fast");
        }, mouseleave: function (e) {
            $("#preview").remove();
        }, mousemove: function (e) {
            $("#preview")
            .css("top",(e.pageY - yOffset) + "px")
            .css("left",(e.pageX + xOffset) + "px");
        }
    }, 'a.preview');
};

var disablePreview = exports.disablePreview = function() {
    $(document).off('mouseenter mouseleave mousemove', 'a.preview');
};
