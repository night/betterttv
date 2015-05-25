var debug = require("../helpers/debug"),
    vars = require("../vars");

var tseInnerTemplate = require('../templates/team_tse-content-inner-div'),
    followButtonTemplate = require('../templates/team_follow-button'),
    buttonTemplate = require('../templates/team_channel-button'),
    tooltipTemplate = require('../templates/team_channel-button-tooltip'),
    playingStatsTemplate = require('../templates/team_now-playing-stats'),
    descAndTitleTemplate = require('../templates/team_channel-description-and-title'),
    playerTemplate = require('../templates/team_video-player'),
    chatTemplate = require('../templates/team_chat-iframe'),
    shareMenuTemplate = require('../templates/team_share-menu');

module.exports = function () {

    if(bttv.settings.get("formatTeamPage") !== true || $("body").attr("data-page") != "teams#show") return;

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
    
    var bttvTeam = {
        name: window.location.pathname.replace(/\/team\/|\/event\//, ""),
        currentChannel: ($(".js-playing").attr("id")).replace("channel_", ""),
        firstLoad: true
    }
    
    bttvTeam.formatPage = function() {
        debug.log("Formatting Team Page");
        var teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
    
        if(bttv.settings.get("darkenedMode") === true) {
            teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page-dark.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
        }
        $("body").append(teamCSS);
    
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
        var followButton = $(followButtonTemplate({"id":"bttvFollowButton", "title":"Click to follow "+bttvTeam.currentChannel, "text":"Follow"}));
        followButton.click(function(e) {
            bttvTeam.followCurrentChannel();
        });
        $(".js-share").before(followButton);
        
        //follow team button
        var followTeamButton = $(followButtonTemplate({"id":"bttvFollowTeamButton", "title":"Click to follow all team channels", "text":"Follow The Team"}));
        followTeamButton.tipsy({"gravity": "w", "fade": true}).click(function(e) {
            bttvTeam.followTeam();
        });
        $("#team_logo").after(followTeamButton);
        
        //chat holder. didn't use a template because it would only be used once by one function
        var newDiv = $("<div>", {"id":"bttvTeamChat"});
        $(".wrapper.c12.clearfix").append(newDiv);
        
        //add column toggle to logo
        $("#team_logo").click(function(e) {
            bttvTeam.toggleLeftColumn();
        });
        $("#team_logo").attr("title", "Click to toggle the left column").tipsy({"gravity": "w", "fade": true});
        
        //didn't use a template because one time use
        var nowPlayingStatsHolder = $("<span>", {"id": "bttvNowPlayingStatsHolder"});
        //move the stuff we wanna keep into the stats holder for temp storage
        nowPlayingStatsHolder.append($("#channel_actions"), $("#description"));
        //empty the garbage, append stats holder, then move the stuff back out of the stats holder
        $("#stats_and_description").empty().append(nowPlayingStatsHolder).append($("#channel_actions"), $("#description"));
        
        //change share button to an action button
        $(".js-share").removeClass("drop").addClass("button primary action").attr("title", "Click for sharing options");
        
        //move share menu into channel_actions for positioning then add tipsy
        $("#channel_actions").append($("#share")).children("a").each(function() {
            $(this).tipsy({"gravity": "s", "fade": true});
        });
        
        //setup the members list for tse scrollbars
        var membersInnerDiv = $(tseInnerTemplate({"id":"bttvTeamMemberListInner"}));
        $("#bttvTeamMemberListOuter").addClass("scroll").empty().append(membersInnerDiv);
        $("#bttvTeamMemberListOuter").TrackpadScrollEmulator({scrollbarHideStrategy: "rightAndBottom"});
        
        debug.log("Team Page Format Complete");
        
        bttvTeam.loadPreviewTemplate();
        bttvTeam.loadTeam();
    }
    
    bttvTeam.loadPreviewTemplate = function() {
        debug.log("loading preview template");
            
        bttv.TwitchAPI.get("/kraken/streams/featured?limit=1")
        .done(function(d) {
            debug.log("got preview template");
            var targetName = d.featured[0].stream.channel.name;
            var targetPreviewUrl = d.featured[0].stream.preview;
            bttvTeam.updatedPreviewUrl = targetPreviewUrl.replace("live_user_"+targetName+"-", "live_user_{{channel}}-");
        })
        .fail(function(d) {
            debug.log("failed getting preview url template during team load");
        });
    }
    
    bttvTeam.loadTeam = function() {
        debug.log("loading team data");
            
        bttv.TwitchAPI.get("/api/team/"+bttvTeam.name+"/all_channels.json")
        .done(function(d) {
            debug.log("Team load success");
            bttvTeam.membersJson = d.channels;
            
            if(bttvTeam.firstLoad === true) {
                bttvTeam.firstLoad = false;
                bttvTeam.loadChannel(bttvTeam.currentChannel);
                bttvTeam.loadTeamInterval = window.setInterval(bttvTeam.loadTeam, 60000);
            } else {
                bttvTeam.loadChannelInfo();
            }
            
            bttvTeam.createButtons();
        })
        .fail(function(data) {
            debug.log("Team load fail");
        });
    }
    
    bttvTeam.createButtons = function() {
        debug.log("creating buttons");
        $("#bttvTeamMemberListInner").empty();
    
        bttvTeam.membersJson.forEach(function(a) {
            var chanName = a.channel.name,
                dispName = a.channel.display_name,
                chanImgUrl = a.channel.image.size50,
                chanGame = a.channel.meta_game,
                chanStatus = a.channel.status,
                chanViewers = a.channel.current_viewers,
                theButtonData = {"name": chanName, "displayName": dispName, "profileImage": chanImgUrl, "tooltip": dispName+" is offline"};
            
            if(chanName === bttvTeam.currentChannel) {
                theButtonData.isPlaying = true;
            }
            
            if(chanStatus === "live") {
                //fallback
                var ttTime = new Date().getTime(),
                    ttImgUrl = "//static-cdn.jtvnw.net/previews-ttv/live_user_"+chanName+"-320x200.jpg?"+ttTime;
                
                if(typeof bttvTeam.updatedPreviewUrl !== "undefined") {
                    ttImgUrl = bttvTeam.updatedPreviewUrl.replace("{{channel}}", chanName)+"?"+ttTime;
                } else {
                    bttvTeam.loadPreviewTemplate();
                }
                
                theButtonData.viewerCount = chanViewers;
                theButtonData.tooltip = tooltipTemplate({"name": dispName, "game": chanGame, "imageUrl": ttImgUrl});
            }
            
            var buttonObject = $(buttonTemplate(theButtonData));
            buttonObject.tipsy({"html": true, "gravity": "w", "opacity": 1.0, "fade": true});
            
            buttonObject.click(function(e) {
                bttvTeam.loadChannel(chanName);
            });
            
            $("#bttvTeamMemberListInner").append(buttonObject);
        });
    }
    
    bttvTeam.loadChannel = function(chan) {
        debug.log("loading channel "+chan);
        bttvTeam.currentChannel = chan;
    
        //swap/reset classes
        $("div.member.js-playing").removeClass("js-playing");
        $("#bttvTeamChannelButton_"+chan).addClass("js-playing");
        $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing");
        
        //load video
        $("#standard_holder").empty();
        var videoPlayer = $(playerTemplate({"channel":chan}));
        $("#standard_holder").append(videoPlayer);
        
        //load chat
        $("#bttvTeamChat").empty();
        var chatEmbed = $(chatTemplate({"channel":chan}));
        $("#bttvTeamChat").append(chatEmbed);
        
        bttvTeam.loadChannelInfo(true);
        
        //check if following
        if(vars.userData.isLoggedIn === true) {
            bttv.TwitchAPI.get("/kraken/users/"+vars.userData.login+"/follows/channels/"+chan)
            .done(function(d) {
                debug.log(vars.userData.login+" is following "+chan);
                $("#bttvFollowButton").hide();
            })
            .fail(function(d) {
                if(d.status == 404) {
                    debug.log(vars.userData.login+" is not following "+chan);
                    $("#bttvFollowButton").attr("title", "Click to follow "+chan).text("Follow").show();
                }
            });
        }
        
        //check if has subs
        bttv.TwitchAPI.get("/api/channels/"+chan+"/product")
        .done(function(d) {
            debug.log(chan+" has subs:"+d.price);
            $("#subscribe_action").attr("href", "//www.twitch.tv/"+chan+"/subscribe?ref=below_video_subscribe_button");
            checkIsSubbed(d.price);
        })
        .fail(function(d) {
            if(d.status == 404) {
                debug.log(chan+" not in sub program");
                $("#subscribe_action").hide();
                $("#subscribe_action").attr("href", "");
            }
        });
        
        var checkIsSubbed = function(price) {
            if(vars.userData.isLoggedIn === true) {
                bttv.TwitchAPI.get("/api/users/"+vars.userData.login+"/tickets?channel="+chan)
                .done(function(d) {
                    if((d.tickets).length != 0) {
                        debug.log(vars.userData.login+" is subbed to "+chan+" len:"+(d.tickets).length);
                        $("#subscribe_action").hide();
                    } else {
                        debug.log(vars.userData.login+" is not subbed to "+chan);
                        $("#subscribe_action").attr("title", "Click to subscribe "+chan).show();
                        $(".subscribe-price").text(price);
                    }
                })
                .fail(function(d) {
                    debug.log("check if "+vars.userData.login+" is subbed to "+chan+" failed");
                });
            }
        }
    }
    
    bttvTeam.loadChannelInfo = function(onChannelLoad) {
        debug.log("loading channel info");
            
        for(var i=0; i<bttvTeam.membersJson.length; i++) {
            if(bttvTeam.membersJson[i].channel.name === bttvTeam.currentChannel) {
                $("#bttvNowPlayingStatsHolder").html(playingStatsTemplate({"channel": bttvTeam.membersJson[i].channel.name, "displayName": bttvTeam.membersJson[i].channel.display_name, "views": bttvTeam.membersJson[i].channel.total_views, "viewers": bttvTeam.membersJson[i].channel.current_viewers, "followers": bttvTeam.membersJson[i].channel.followers_count, "game": bttvTeam.membersJson[i].channel.meta_game}));
                $("#description").html(descAndTitleTemplate({"description":bttvTeam.membersJson[i].channel.description, "title":bttvTeam.membersJson[i].channel.title}));
                
                if(onChannelLoad) {
                    $("#share").html(shareMenuTemplate({"channel": bttvTeam.membersJson[i].channel.name, "displayName": bttvTeam.membersJson[i].channel.display_name, "game": bttvTeam.membersJson[i].channel.meta_game, "embedText": playerTemplate({"channel":bttvTeam.membersJson[i].channel.name})}));
                }
                
                $("#bttvNowPlayingStatsHolder").children().each(function() {
                    $(this).tipsy({"gravity": "s", "fade": true});
                });
                
                break;
            }
        }
    }
    
    bttvTeam.followCurrentChannel = function() {
        if(vars.userData.isLoggedIn === true) { 
            $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            
            bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+bttvTeam.currentChannel)
            .done(function(d){
                debug.log(vars.userData.login+" is now following "+bttvTeam.currentChannel);
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-success").text("Followed");
            })
            .fail(function(d){
                debug.log(vars.userData.login+" follow "+bttvTeam.currentChannel+" failed");
                $("#bttvFollowButton").removeClass("bttv-team-follow-processing").addClass("bttv-team-follow-fail").text("Error");
            });
        } else {
            $("#header_login").click();
        }
    }
    
    bttvTeam.followTeam = function() {
        if(vars.userData.isLoggedIn === true) {
            var responseCount = 0,
                teamFollowFailedList = [];
                
            $("#bttvFollowTeamButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing").addClass("bttv-team-follow-processing");
            $("#bttvFollowTeamButton").attr("title", "").text("Processing...");
            
            bttvTeam.membersJson.forEach(function(a) {
                bttv.TwitchAPI.put("/kraken/users/"+vars.userData.login+"/follows/channels/"+a.channel.name)
                .done(function(d){
                    responseCount ++;
                    
                    if(responseCount === bttvTeam.membersJson.length) {
                        $("#bttvFollowTeamButton").removeClass("bttv-team-follow-processing").text("Team Follow Complete");
                        
                        if(teamFollowFailedList.length > 0) {
                            $("#bttvFollowTeamButton").addClass("bttv-team-follow-fail").text("Team Follow Complete ("+ teamFollowFailedList.length + " Errors)");
                            $("#bttvFollowTeamButton").attr("title", "Following Errors: "+teamFollowFailedList);
                            alert("Following Errors: "+teamFollowFailedList);
                        } else {
                            $("#bttvFollowTeamButton").addClass("bttv-team-follow-success");
                        }
                    }
                })
                .fail(function(a, b, c){
                    responseCount ++;
                    
                    if(typeof a.responseJSON.message !== "undefined") {
                        //error message from the API (ie: channel doesn't exist, channel unprocessable, etc)
                        debug.log("Follow Failed: "+a.responseJSON.message);
                        teamFollowFailedList.push(a.responseJSON.message);
                    } else {
                        //error message from time out etc
                        debug.log("Follow Failed: "+c);
                        teamFollowFailedList.push(c);
                    }
                    
                    if(responseCount === bttvTeam.membersJson.length) {
                        $("#bttvFollowTeamButton").removeClass("bttv-team-follow-processing").text("Team Follow Complete");
                        
                        if(teamFollowFailedList.length > 0) {
                            $("#bttvFollowTeamButton").addClass("bttv-team-follow-fail").text("Team Follow Complete ("+ teamFollowFailedList.length + " Errors)");
                            $("#bttvFollowTeamButton").attr("title", "Following Errors: "+teamFollowFailedList);
                            alert("Following Errors: "+teamFollowFailedList);
                        } else {
                            $("#bttvFollowTeamButton").addClass("bttv-team-follow-success");
                        }
                    }
                });
            });
        } else {
            $("#header_login").click();
        }
    }
    
    bttvTeam.toggleLeftColumn = function() {
        if($(".bttv-team-left-column-mini").length) {
            $(".filters.grid.c4").removeClass("bttv-team-left-column-mini");
            $("#bttvFollowTeamButton").removeClass("bttv-team-follow-mini").text("Follow The Team");
        } else {
            $(".filters.grid.c4").addClass("bttv-team-left-column-mini");
            $("#bttvFollowTeamButton").addClass("bttv-team-follow-mini").text("Follow");
        }
        $(window).resize();
    }
    
    bttvTeam.formatPage();
}