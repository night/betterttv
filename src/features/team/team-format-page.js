var debug = require("../../debug"),
    vars = require("../../vars"),
    tseInnerTemplate = require('../../templates/team_tse-content-inner-div'),
    followButtonTemplate = require('../../templates/team_follow-button'),
    loadTeam = require("./team-load-team");

module.exports = function () {

    if(bttv.settings.get("formatTeamPage") !== true || $("body").attr("data-page") != "teams#show") return;
    debug.log("Formatting team page");
    
    //var jquiJS  = $("<script>", {"src":"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js", "type":"text/javascript"}),
    var jquiJS  = $("<script>", {"src":"//cdn.betterttv.net/src/features/team/jquery-ui-1.11.1.min.js", "type":"text/javascript"}),
        teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
    
    if(bttv.settings.get("darkenedMode") === true) {
        teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page-dark.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
    }
    $('body').append(jquiJS, teamCSS);
    
    //kill Twitch timers to update channel list, viewer count, etc (not ideal, i know)
    //need to figure out the original functions so i can take them over
    var maxId = setTimeout(function() {}, 0);
    for(var i=0; i < maxId; i+=1) {
        clearTimeout(i);
    }

    //remove "Members" text between team logo and member list
    $(".filters.grid.c4 h2").remove();
    //move team banner into about section
    $("#about").prepend($("#banner_header"));
    
    //setup player column for tse scrollbar and move all column elements inside inner div
    var playerColInnerDiv = $(tseInnerTemplate({"id":"bttvTeamMemberListInner"}));
    playerColInnerDiv.append($("#live_player"), $("#team_info_tabs"), $("#videos"), $("#about"), $("#site_footer"));
    $("#player_column").addClass("scroll").append(playerColInnerDiv);
    $("#player_column").TrackpadScrollEmulator({scrollbarHideStrategy: 'rightAndBottom'});
    
    //follow current channel button
    var followButton = $(followButtonTemplate({"id":"bttvFollowButton"}));
    followButton.text("Follow");
    followButton.click(function(e) {
        followCurrentChannel();
    });
    $(".js-share").before(followButton);
    
    //follow team button
    var followTeamButton = $(followButtonTemplate({"id":"bttvFollowTeamButton"}));
    followTeamButton.text("Follow The Whole Team");
    followTeamButton.click(function(e) {
        populateFollowQueue();
    });
    $("#team_logo").after(followTeamButton);
    
    //chat holder
    var newDiv = $("<div>", {"id":"bttvTeamChat"});
    $(".wrapper.c12.clearfix").append(newDiv);
    
    //add column toggle to logo (for now. todo: add the small arrows)
    $("#team_logo").click(function(e) {
        toggleLeftColumn();
    });
    
    //change share drop down to an action button
    $(".js-share").removeClass("drop").addClass("button primary action");
    
    //updated the resizing
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
        $("#team_member_list").css({"height":teamListHeight+"px"});
    });

    var teamFollowList = "none",
        teamFollowedFailedList = "none",
        teamFollowRequestCount = 0,
        teamFollowResponseCount = 0,
        teamFollowInterval = "none";
        
    vars.teamCurrentChannel = ($(".js-playing").attr("id")).replace("channel_", "");
    vars.teamFirstLoad = 1;
    
    //grab a featured stream so we can get a preview image url template
    debug.log("calling streams");
    bttv.TwitchAPI.get("/kraken/streams/featured?limit=1")
    .done(function(d) {
        debug.log("got preview url template");
        var chanName = d.featured[0].stream.channel.name;
        var updatedPreviewUrl = d.featured[0].stream.preview;
        vars.updatedPreviewUrl = updatedPreviewUrl.replace(chanName, "CHANNEL");
        
        //loadTeam();
    })
    .fail(function(d) {
        debug.log("failed getting featured streams for preview url template");
        //loadTeam();
    });
    
    //still have to delay it for Firefox (Chrome is fine)
    //anytime i make a ref to bttv.TwitchAPI too quickly i get a bttv.TwitchAPI._ref is null error
    //so in FF the streams/featured call above always fails at load, but works later
    setTimeout(loadTeam, 500);
    //loadTeam();
    
    var toggleLeftColumn = function() {
        if($(".bttv-team-left-column-mini").length) {
            $(".filters.grid.c4").removeClass("bttv-team-left-column-mini");
            followTeamButton.removeClass("bttv-team-follow-mini").text("Follow The Team");
        } else {
            $(".filters.grid.c4").addClass("bttv-team-left-column-mini");
            followTeamButton.addClass("bttv-team-follow-mini").text("Follow");
        }
        $(window).resize();
    }
    
    var followCurrentChannel = function() {
        if(vars.userData.isLoggedIn === true) { 
            debug.log("processing follow");
            $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+vars.teamCurrentChannel)
            .done(function(d){
                debug.log(vars.userData.login+" is now following "+vars.teamCurrentChannel);
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-success");
            })
            .fail(function(d){
                debug.log(vars.userData.login+" follow "+vars.teamCurrentChannel+" failed");
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-fail");
            });
        } else {
            debug.log("need to login");
            $("#header_login").click();
            //window.location.href = "/login";
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
            //alert("You need to log in first!");
            $("#header_login").click();
        } else {
            //reset everything in case it's not first team follow since the page loaded, or accidental double click, etc
            teamFollowList = [];
            teamFollowFailedList = [];
            teamFollowRequestCount = 0;
            teamFollowResponseCount = 0;
            
            //followTeamButton is defined on line 65 as a jquery object. does it matter if the variable name has a $ in it?
            followTeamButton.removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            followTeamButton.attr("title", "").text("Processing...");
            
            vars.jsnTeam.forEach(function(a) {
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
            followTeamButton.removeClass("bttv-team-follow-processing");
            followTeamButton.text("Team Follow Complete");
            window.clearInterval(teamFollowInterval);
            
            if(teamFollowFailedList.length > 0) {
                followTeamButton.addClass("bttv-team-follow-fail");
                followTeamButton.text("Team Follow Complete ("+ teamFollowFailedList.length + " Errors)");
                var failedString = "Following errors: ";
                
                teamFollowFailedList.forEach(function(a) {
                    failedString += a+", ";
                });
                //don't have to trim it but a comma following the last item in a list drives me crazy lol
                failedString = failedString.slice(0, -2);
                
                followTeamButton.attr("title", failedString);
                alert(failedString);
            } else {
                followTeamButton.addClass("bttv-team-follow-success");
            }
        }
    }
    
    
    /* Alternative
    //it's recursive but just uses callbacks and no a timers at all. which is lesser of 2 evils lol?
    //we will also know the channel name for any follows that fail due to time out or etc unlike using the interval
    
    var populateFollowQueue = function () {
        if(vars.userData.isLoggedIn === false) {
            //alert("You need to log in first!");
            $("#header_login").click();
        } else {
            teamFollowList = [];
            teamFollowFailedList = [];
            
            //followTeamButton is defined on line 65 as a jquery object. does it matter if the variable name has a $ in it?
            followTeamButton.removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            followTeamButton.text("Processing...");
            followTeamButton.attr("title", "");
            
            vars.jsnTeam.forEach(function(a) {
                teamFollowList.push(a.channel.name);
            });
            
            followTeam();
        }
    }
    
    var followTeam = function() {
        var targetChannel = teamFollowList[0];
            
        bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+targetChannel)
        .done(function(data) {
            teamFollowList.splice(0, 1);
            
            if(teamFollowList.length > 0) {
                followTeam();
            } else {
                teamFollowComplete();
            }
        })
        .fail(function(a, b, c) {
            if(typeof a.responseJSON.message !== "undefined") {
                //error message from the API (ie: channel doesn't exist, channel unprocessable, etc)
                debug.log("Follow Failed: "+a.responseJSON.message);
                teamFollowFailedList.push(a.responseJSON.message);
            } else {
                //error message from time out etc
                debug.log("Follow Failed: "+c);
                teamFollowFailedList.push(targetChannel+" - "+c);
            }
            
            teamFollowList.splice(0, 1);
            
            if(teamFollowList.length > 0) {
                followTeam();
            } else {
                teamFollowComplete();
            }
        });
    }
    
    var teamFollowComplete = function() {
        followTeamButton.removeClass("bttv-team-follow-processing");
        followTeamButton.text("Team Follow Complete");
        
        if(teamFollowFailedList.length > 0) {
            followTeamButton.addClass("bttv-team-follow-fail");
            followTeamButton.text("Team Follow Complete ("+ teamFollowFailedList.length + " Errors)");
            var failedString = "Following errors: ";
            
            teamFollowFailedList.forEach(function(a) {
                failedString += a+", ";
            });
            //don't have to trim it but a comma following the last item in a list drives me crazy lol
            failedString = failedString.slice(0, -2);
            
            followTeamButton.attr("title", failedString);
            alert(failedString);
        } else {
            followTeamButton.addClass("bttv-team-follow-success");
        }
    }
    */
}