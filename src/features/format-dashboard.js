var debug = require('../debug');

module.exports = function () {
    if ($("#dash_main").length) {
        debug.log("Formatting Dashboard");

        // reorder left column
        $("#dash_main #controls_column .dash-hostmode-contain").appendTo("#dash_main #controls_column");
        $("#dash_main #controls_column .dash-player-contain").appendTo("#dash_main #controls_column");

        // We move the commercial button inside the box with other dash control.
        $("#dash_main #commercial_buttons").appendTo("#dash_main .dash-broadcast-contain");

        // Small Dashboard Fixes
        $("#commercial_options .dropmenu_action[data-length=150]").text("2m 30s");
        $("#controls_column #form_submit button").attr("class", "primary_button");
    }
}
