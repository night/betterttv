var debug = require('../debug');

module.exports = function () {
    if(!$("#dash_main").length) return;

    if(bttv.settings.get("flipDashboard") === true) {
        debug.log("Flipping Dashboard");

        // We want to move the chat to the left, and the dashboard controls to the right.
        $("#dash_main .dash-chat-column").css({
            float: "left",
            right: "initial"
        });
        $("#dash_main #controls_column").css({
            float: "right",
            left: "20px"
        });
    } else {
        $("#dash_main .dash-chat-column").css({
            float: "none",
            right: "0px"
        });
        $("#dash_main #controls_column").css({
            float: "left",
            left: "0px"
        });
    }
}
