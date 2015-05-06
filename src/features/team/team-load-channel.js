var debug = require('../../debug'),
    vars = require("../../vars"),
    playerTemplate = require('../../templates/team_video-player'),
    chatTemplate = require('../../templates/team_chat-iframe'),
    playingStatsTemplate = require('../../templates/team_now-playing-stats'),
    shareMenuTemplate = require('../../templates/team_share-menu'),
    descAndTitleTemplate = require('../../templates/team_channel-description-and-title');

module.exports = function(chan) {
    debug.log("Loading channel "+chan);
    
    $("div.member.js-playing").removeClass("js-playing");
    $("#bttvTeamChannelButton_"+chan).addClass("js-playing");
    $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing")
    
    vars.teamCurrentChannel = chan;
    
    var loadVideo = function() {
        $("#standard_holder").empty();
        var player = $(playerTemplate({"channel":chan}));
        $("#standard_holder").append(player);
    }
    
    var loadChat = function() {
        $("#bttvTeamChat").empty();
        var chatEmbed = $(chatTemplate({"channel":chan}));
        $("#bttvTeamChat").append(chatEmbed);
    }
    
    var loadChannelInfo = function() {
        var jsnTeam = vars.teamMembersJson;
        
        for(var i=0; i<jsnTeam.length; i++) {
            if(jsnTeam[i].channel.name === chan) {
                $("#bttvNowPlayingStatsHolder").html(playingStatsTemplate({"channel": jsnTeam[i].channel.name, "displayName": jsnTeam[i].channel.display_name, "views": jsnTeam[i].channel.total_views, "viewers": jsnTeam[i].channel.current_viewers, "followers": jsnTeam[i].channel.followers_count, "game": jsnTeam[i].channel.meta_game}));
                $("#description").html(descAndTitleTemplate({"description":jsnTeam[i].channel.description, "title":jsnTeam[i].channel.title}));
                $("#share").html(shareMenuTemplate({"channel": jsnTeam[i].channel.name, "displayName": jsnTeam[i].channel.display_name, "game": jsnTeam[i].channel.meta_game, "embedText": playerTemplate({"channel":chan})}));
                
                $("#bttvNowPlayingStatsHolder").children().each(function() {
                    $(this).tipsy({"gravity": "s", "fade": true});
                });
                
                break;
            }
        }
    }
    
    var checkIsFollowing = function() {
        if(vars.userData.isLoggedIn === true) {
            bttv.TwitchAPI.get("/kraken/users/"+vars.userData.login+"/follows/channels/"+chan)
            .done(function(d) {
                debug.log(vars.userData.login+" is following "+chan);
                $("#bttvFollowButton").hide();
            })
            .fail(function(d) {
                if(d.status == 404) {
                    debug.log(vars.userData.login+" is not following "+chan);
                    $("#bttvFollowButton").attr("title", "Click to follow "+chan).show();
                }
            });
        }
    }
    
    var checkIfHasSubs = function() {
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
    }
    
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
    
    //you said you wanted me to use more functions.
    //am i being too literal by breaking all of this up into individual functions?
    loadVideo();
    loadChat();
    loadChannelInfo();
    checkIsFollowing();
    checkIfHasSubs();
}