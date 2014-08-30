var debug = require("../debug"),
    vars = require("../vars"),
    loadTeam = require("./team-load-team");

module.exports = function () {

    if(bttv.settings.get("formatTeamPage") !== true || $("body").attr("data-page") != "teams#show") return;
    debug.log("Formatting team page");

    //add the CSS and JS
    var jquiCSS = $("<link>", {"href":"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/dark-hive/jquery-ui.min.css", "type":"text/css", "rel":"stylesheet"}),
        jquiJS  = $("<script>", {"src":"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js", "type":"text/javascript"}),
        teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
    
    if(bttv.settings.get("darkenedMode") === true) {
        teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page-dark.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
    }
    $('body').append(jquiCSS, jquiJS, teamCSS);

    //remove "Members" text below team logo
    $("h2").remove();

    //move team banner into info section
    $("#about").prepend($("#banner_header"));

    //add follow team button
    var followTeamButton = $("<a>", {"id":"followTeamBtn", "data-ember-action":"135", "class":"js-follow follow button primary action"});
    followTeamButton.text("Follow The Whole Team");
    followTeamButton.click(function(e) {
        followTeam();
    });
    $("#team_logo").after(followTeamButton);

    //add chat holder
    var newDiv = $("<div>", {"id":"team_chat"});
    $(".wrapper.c12.clearfix").append(newDiv);

    //for w/e reason i can't open the share menu from the share btn onclick, i have to hook the doc click
    $(document).click(function(e) {
        if(e.target.id =="sharebtn") {
            var o = $(e.target).offset(),
                offsetLeft = o.left + 1,
                offsetTop = o.top + 42;
            $("#share").css({"top":offsetTop+"px", "left":offsetLeft+"px"}).toggle("blind");
        }
    });

    //dynamic element sizing
    $(window).resize(function() {
        var vpWidth = $(window).width(),
            vpHeight = $(window).height(),
            paddedWidth = vpWidth - 40;

        if(paddedWidth < 985) {
            paddedWidth = 985;
        }

        //left col + right col + margins = 685
        var playerWidth = paddedWidth - 685,
            arMultiplier = (playerWidth - 2) / 16,
            playerHeight = (9 * arMultiplier) + 32;

        $("div.main.discovery.team").css("width", vpWidth+"px");
        $("div.wrapper.c12.clearfix").css("width", paddedWidth+"px");
        $("#player_column").css("width", playerWidth+"px");
        $("#site_footer").css("width", playerWidth+"px");
        $("#standard_holder").css({"width":(playerWidth - 2)+"px", "height":playerHeight+"px"});

        if($("#team_chat").length) {
            var chatHeight = $("#live_player").height() - 2;
            $("#team_chat").css("height", chatHeight+"px");
        }

        var teamListHeight = ( ($("#live_player").height() - $("#team_logo").height()) - 76 );
        $("#team_member_list").css({"height":teamListHeight+"px"});
    });

    //clear all the twitch timers for updating member list, updating selected chan info, etc
    var maxId = setTimeout(function() {}, 0);
    for(var i=0; i < maxId; i+=1) { 
            clearTimeout(i);
    }

    var followList = "none",
        uName = cookie.get("login");
        
    vars.teamCurrentChannel = ($(".js-playing").attr("id")).replace("channel_", "");
    vars.teamFirstLoad = 1;
    setTimeout(loadTeam, 1000);
    
    var followTeam = function() {
        if(typeof uName === "undefined") {
            alert("You need to log in first!");
        } else {
            followList = [];
            
            vars.jsnTeam.forEach(function(a) {
                followList.push(a.channel.name);
            });
            throttledFollow();
        }
    }
    
    var throttledFollow = function() {
        if(followList.length > 0) {
            var targetChan = followList[0];
            $("#followTeamBtn").css({"background-color":"#B9A3E3"});
            $("#followTeamBtn").text("Following "+targetChan+" ...");

            Twitch.api.put("/kraken/users/"+uName+"/follows/channels/"+targetChan)
            .done(function(d) {
                debug.log("follow success for:"+targetChan);
                $("#followTeamBtn").css({"background-color":"green"});
                $("#followTeamBtn").text("Followed "+targetChan);
                
                if(targetChan == vars.jsnTeam[vars.jsnTeam.length - 1].channel.name) {
                    setTimeout(followListComplete, 1000);
                }
                followList.splice(0, 1);
                setTimeout(throttledFollow, 200);
            })
            .fail(function(a, b, c) {
                debug.log("follow failed for:"+targetChan);
                
                if(typeof a.responseJSON.message !== "undefined") {
                    debug.log("follow for "+targetChan+" failed:"+a.responseJSON.message);
                    $("#followTeamBtn").text(a.responseJSON.message).css({"background-color":"red"});
                } else {
                    debug.log("follow failed for "+targetChan+" - "+c);
                    $("#followTeamBtn").text("Follow Failed For "+targetChan+" - "+b).css({"background-color":"red"});
                }
                followList.splice(0, 1);
                setTimeout(throttledFollow, 5000);
            });
        }
    }

    var followListComplete = function() {
        $("#followTeamBtn").delay(3000).text("Follow Team Complete");
        debug.log("########## Follow Team Function Complete ##########");
    }
}