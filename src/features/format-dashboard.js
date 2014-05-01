var debug = require('debug');

module.exports = function () {
    if ($("#dash_main").length) {
        debug.log("Formatting Dashboard");

        // Move Page Elements to Sub-DIV & Account for Changes
        $('<div style="position:relative;" id="bttvDashboard"></div>').appendTo('#dash_main');
        $("#dash_main #controls_column").appendTo("#bttvDashboard");
        $("#dash_main #player_column").appendTo("#bttvDashboard");
        $("#dash_main iframe").css("top",
            (bttv.settings.get('darkenedMode') ? 11 : 0)+
            (($('.js-broadcaster-message').css('display') !== 'none') ? $('.js-broadcaster-message').outerHeight(true) : 0)+
            $('#dashboard_title').outerHeight(true)+
            $('#setup_link').outerHeight(true)+
            $('#dash_nav').outerHeight(true)+
            $('#stream-config-status').outerHeight(true)
        ).css("border","none");
        if($("#dash_main iframe").length) {
            $("#dash_main iframe")[0].style.height = "514px";
            $("#dash_main iframe")[0].src = "/"+bttv.getChannel()+"/chat?bttvDashboard=true";
        }

        // Small Dashboard Fixes
        $("#commercial_options .dropmenu_action[data-length=150]").text("2m 30s");
        $("#controls_column #form_submit button").attr("class", "primary_button");
    }
}