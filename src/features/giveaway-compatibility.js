var debug = require('../debug');

module.exports = function () {
    if ($("#dash_main").length) {
        debug.log("Giveaway Plugin Dashboard Compatibility");

        $(".tga_modal").appendTo("#bttvDashboard");
        $(".tga_button").click(function () {
            if (bttv.settings.get("flipDashboard") === true) {
                $("#chat").width("330px");
                $(".tga_modal").css("right", "0px");
            } else {
                $("#chat").width("330px");
                $(".tga_modal").css("right", "inherit");
            }
        });
        $("button[data-action=\"close\"]").click(function () {
            $("#chat").width("500px");
        });
    }
};