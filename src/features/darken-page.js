var debug = require('../helpers/debug'),
    handleBackground = require('./handle-background');

module.exports = function () {
    var $body = $('body');

    /* Twitch broke BGs */
    setTimeout(handleBackground, 1000);

    if(bttv.settings.get("darkenedMode") !== true || !$body.attr('data-page')) return;

    debug.log("Darkening Page");

    var pageKind = $('body').data('page').split('#')[0],
        pageType = $('body').data('page').split('#')[1] || "none",
        allowedPages = ['ember', 'message', 'dashboards', 'chat', 'chapter', 'archive', 'channel', 'user', 'bookmark'];

    if(allowedPages.indexOf(pageKind) !== -1) {

        if(pageKind === "dashboards" && pageType !== "show" || pageType === "legal") return;

        var darkCSS = document.createElement("link");
        darkCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-dark.css?"+bttv.info.versionString());
        darkCSS.setAttribute("type", "text/css");
        darkCSS.setAttribute("rel", "stylesheet");
        darkCSS.setAttribute("id", "darkTwitch");
        $('body').append(darkCSS);

        $("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display", "none");
        //setTimeout(handleBackground, 1000);

        // Messages Delete Icon Fix
        $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g18_trash-00000080.png"]').attr("src", "//cdn.betterttv.net/style/icons/delete.png");
        $('#main_col .messages img[src="http://www-cdn.jtvnw.net/images/xarth/g/g16_trash-00000020.png"]').attr("src", "//cdn.betterttv.net/style/icons/delete.png").attr("width","16").attr("height","16");
    }

}