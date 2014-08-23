var debug = require('debug');

module.exports = function () {
    if ($("#dash_main").length && bttv.settings.get("flipDashboard") === true) {
        debug.log("Flipping Dashboard");

        // We want to move the chat to the left, and the dashboard controls to the right.
        $("#controls_column, #player_column").css({
            float: "right",
            marginLeft: "520px",
            marginRight: "0px"
        });
        $("#dash_main .dash-items-contain").css({
            float: "left",
            left: "20px",
            right: ""
        });
    }
}