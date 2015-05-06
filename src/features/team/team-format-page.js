var debug = require("../../debug"),
    vars = require("../../vars"),
    tseInnerTemplate = require('../../templates/team_tse-content-inner-div'),
    followButtonTemplate = require('../../templates/team_follow-button'),
    loadTeam = require("./team-load-team");

module.exports = function () {
    if(bttv.settings.get("formatTeamPage") !== true || $("body").attr("data-page") != "teams#show") return;
    
    vars.teamCurrentChannel = ($(".js-playing").attr("id")).replace("channel_", "");
    vars.teamFirstLoad = 1;
    vars.teamName = window.location.pathname.replace(/\/team\/|\/event\//, "");
    
    var teamFollowList = "none",
        teamFollowedFailedList = "none",
        teamFollowRequestCount = 0,
        teamFollowResponseCount = 0,
        teamFollowInterval = "none";
        
    $(window).resize(function() {
        var vpWidth = $(window).width(),
            vpHeight = $(window).height(),
            paddedWidth = vpWidth - 40,
            paddedHeight = vpHeight - ($("#site_header").outerHeight(true) + 40),
            teamListHeight = paddedHeight - ($("#team_logo").outerHeight(true) + $("#bttvFollowTeamButton").outerHeight(true) + 2),
            playerWidth = paddedWidth - ($(".filters.grid.c4").outerWidth(true) + $("#bttvTeamChat").outerWidth(true) + 2),
            arMultiplier = (playerWidth) / 16,
            playerHeight = (9 * arMultiplier) + 32;
            
        if(paddedWidth < 985) {
            paddedWidth = 985;
        }

        $("div.main.discovery.team").css("width", vpWidth+"px");
        $("div.wrapper.c12.clearfix").css("width", paddedWidth+"px");
        $("#player_column").css({"width":(playerWidth+2)+"px", "height":paddedHeight+"px"});
        $("#site_footer").css("width", playerWidth+"px");
        $("#standard_holder").css({"width":playerWidth+"px", "height":playerHeight+"px"});
        $("#bttvTeamChat").css("height", (paddedHeight-2)+"px");
        $("#bttvTeamMemberListOuter").css({"height":teamListHeight+"px"});
    });
    
    var betterTeamInit = function() {
        var teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
        
        if(bttv.settings.get("darkenedMode") === true) {
            teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page-dark.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
        }
        $("body").append(teamCSS);
        
        getFeatured();
        formatTeamPage();
        //if it wasn't for the bttv.TwitchAPI._ref is null error in Firefox, I would just load the team without the timeout
        setTimeout(loadTeam, 1000);
    }
    
    var getFeatured = function() {
        bttv.TwitchAPI.get("/kraken/streams/featured?limit=1")
        .done(function(d) {
            //debug.log("got preview url template on load");
            var chanName = d.featured[0].stream.channel.name;
            var updatedPreviewUrl = d.featured[0].stream.preview;
            vars.updatedPreviewUrl = updatedPreviewUrl.replace(chanName, "CHANNEL");
        })
        .fail(function(d) {
            debug.log("failed loading preview url template on load");
        });
    }
    
    var formatTeamPage = function() {
        debug.log("Formatting Team Page");
        
        //remove "Members" text between team logo and member list
        $(".filters.grid.c4 h2").remove();
        //move team banner into about section
        $("#about").prepend($("#banner_header"));
        //change the id so the anonymous function on a timer can't find it (and stops)
        $("#team_member_list").attr("id", "bttvTeamMemberListOuter");
        
        //setup player column for tse scrollbar and move all column elements inside inner div
        var playerColInnerDiv = $(tseInnerTemplate({"id":"bttvTeamPlayerColumnInner"}));
        playerColInnerDiv.append($("#live_player"), $("#team_info_tabs"), $("#videos"), $("#about"), $("#site_footer"));
        $("#player_column").addClass("scroll").append(playerColInnerDiv);
        $("#player_column").TrackpadScrollEmulator({scrollbarHideStrategy: 'rightAndBottom'});
        
        //follow current channel button
        var followButton = $(followButtonTemplate({"id":"bttvFollowButton", "title":"Click to follow "+vars.teamCurrentChannel, "text":"Follow"}));
        followButton.click(function(e) {
            followCurrentChannel();
        });
        $(".js-share").before(followButton);
        
        //follow team button
        var followTeamButton = $(followButtonTemplate({"id":"bttvFollowTeamButton", "title":"Click to follow all team channels", "text":"Follow The Team"}));
        followTeamButton.tipsy({"gravity": "w", "fade": true}).click(function(e) {
            populateFollowQueue();
        });
        $("#team_logo").after(followTeamButton);
        
        //chat holder. didn't use a template because it would only be used once by one function
        var newDiv = $("<div>", {"id":"bttvTeamChat"});
        $(".wrapper.c12.clearfix").append(newDiv);
        
        //add column toggle to logo
        $("#team_logo").click(function(e) {
            toggleLeftColumn();
        });
        $("#team_logo").attr("title", "Click to toggle the left column").tipsy({"gravity": "w", "fade": true});
        
        //add now playing stats holder (so we can use template to update stats) and dump the garbage that we can't remove by class/id
        var tempActionsObject = $("#channel_actions").clone(true),
            tempDescObject = $("#description").clone(),
            //no template because one time use
            nowPlayingStatsHolder = $("<span>", {"id": "bttvNowPlayingStatsHolder"});
        $("#stats_and_description").empty().append(nowPlayingStatsHolder, tempActionsObject, tempDescObject);
        
        //change share button to an action button
        $(".js-share").removeClass("drop").addClass("button primary action").attr("title", "Click for sharing options");
        
        //tipsy everywhere! lol
        $("#channel_actions").append($("#share")).children("a").each(function() {
            $(this).tipsy({"gravity": "s", "fade": true});
        });
    }
    
    var toggleLeftColumn = function() {
        if($(".bttv-team-left-column-mini").length) {
            $(".filters.grid.c4").removeClass("bttv-team-left-column-mini");
            $("#bttvFollowTeamButton").removeClass("bttv-team-follow-mini").text("Follow The Team");
        } else {
            $(".filters.grid.c4").addClass("bttv-team-left-column-mini");
            $("#bttvFollowTeamButton").addClass("bttv-team-follow-mini").text("Follow");
        }
        $(window).resize();
    }
    
    var followCurrentChannel = function() {
        if(vars.userData.isLoggedIn === true) { 
            //debug.log("processing follow");
            $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            
            bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+vars.teamCurrentChannel)
            .done(function(d){
                //debug.log(vars.userData.login+" is now following "+vars.teamCurrentChannel);
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-success").text("Followed");
            })
            .fail(function(d){
                debug.log(vars.userData.login+" follow "+vars.teamCurrentChannel+" failed");
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-fail").text("Error");
            });
        } else {
            $("#header_login").click();
        }
    }
    
    /*
    My implementation of your suggestion to use a queue and interval...
    I still needed 3 functions because with an interval the queue is always cleared before we get back all the responses.
    So I never know if a given response was the last response (and we are done following) so I could then show a completed
    message or a list of follows that failed... Unless I compared the number of responses to requests with a third function lol.
    */
    
    var populateFollowQueue = function () {
        if(vars.userData.isLoggedIn === false) {
            $("#header_login").click();
        } else {
            //reset everything in case it's not first team follow since the page loaded, or accidental double click, etc
            teamFollowList = [];
            teamFollowFailedList = [];
            teamFollowRequestCount = 0;
            teamFollowResponseCount = 0;
            
            $("#bttvFollowTeamButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            $("#bttvFollowTeamButton").attr("title", "").text("Processing...");
            
            //vars.jsnTeam.forEach(function(a) {
            vars.teamMembersJson.forEach(function(a) {
                teamFollowList.push(a.channel.name);
            });
            
            //clear it first (ie: just in case the user double clicked, ghost clicked, etc)
            window.clearInterval(teamFollowInterval);
            teamFollowInterval = window.setInterval(followTeam, 300);
        }
    }
    
    var followTeam = function() {
        if(teamFollowList.length > 0) {
            var targetChannel = teamFollowList[0];
            teamFollowRequestCount += 1;
            teamFollowList.splice(0, 1);
                
            bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+targetChannel)
            .done(function(data) {
                teamFollowResponseCount += 1;
                isFollowingComplete();
            })
            .fail(function(a, b, c) {
                teamFollowResponseCount += 1;
                isFollowingComplete();
                
                if(typeof a.responseJSON.message !== "undefined") {
                    //error message from the API (ie: channel doesn't exist, channel unprocessable, etc)
                    debug.log("Follow Failed: "+a.responseJSON.message);
                    teamFollowFailedList.push(a.responseJSON.message);
                } else {
                    //error message from time out etc but we won't know for which channel(s)
                    debug.log("Follow Failed: "+c);
                    teamFollowFailedList.push(c);
                }
            });
        }
    }
    
    var isFollowingComplete = function() {
        if(teamFollowList.length === 0 && teamFollowResponseCount === teamFollowRequestCount) {
            $("#bttvFollowTeamButton").removeClass("bttv-team-follow-processing").text("Team Follow Complete");
            window.clearInterval(teamFollowInterval);
            
            if(teamFollowFailedList.length > 0) {
                $("#bttvFollowTeamButton").addClass("bttv-team-follow-fail").text("Team Follow Complete ("+ teamFollowFailedList.length + " Errors)");
                var failedString = "Following errors: ";
                
                teamFollowFailedList.forEach(function(a) {
                    failedString += a+", ";
                });
                //don't have to trim it but a comma following the last item in a list drives me crazy lol
                failedString = failedString.slice(0, -2);
                
                $("#bttvFollowTeamButton").attr("title", failedString);
                alert(failedString);
            } else {
                $("#bttvFollowTeamButton").addClass("bttv-team-follow-success");
            }
        }
    }
    
    betterTeamInit();
}