var debug = require('../../debug'),
    vars = require("../../vars"),
    playerTemplate = require('../../templates/team_video-player'),
    chatTemplate = require('../../templates/team_chat-iframe'),
    shareMenuTemplate = require('../../templates/team_share-menu-iframes'),
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
        
        loadChat();
        loadChannelInfo();
    }
    
    var loadChat = function() {
        $("#bttvTeamChat").empty();
        var chatEmbed = $(chatTemplate({"channel":chan}));
        $("#bttvTeamChat").append(chatEmbed);
    }
    
    var loadChannelInfo = function() {
        var jsnTeam = vars.jsnTeam;
        
        for(var i=0; i<jsnTeam.length; i++) {
            if(jsnTeam[i].channel.name === chan) {
                //info below player - hooray for recycling! lol
                $("#channel_viewer_count").text(jsnTeam[i].channel.current_viewers);
                $("#views_count").text(jsnTeam[i].channel.total_views);
                $("#followers_count").text(jsnTeam[i].channel.followers_count);
                $("#live_channel_name").attr("href", "/"+chan).text(jsnTeam[i].channel.display_name+" playing "+jsnTeam[i].channel.meta_game);
                
                $("#description").html(descAndTitleTemplate({"description":jsnTeam[i].channel.description, "title":jsnTeam[i].channel.title}));
                
                //update share menu
                $("#channel_url").val("http://www.twitch.tv/"+chan);
                $("#live_embed").val(playerTemplate({"channel":chan}));
                
                //share menu facebook - can't recycle
                $("#facebook_like_button").empty();
                var facebookFrame = $(shareMenuTemplate({"id":"facebook_like_iframe", "channel": chan}));
                $("#facebook_like_button").append(facebookFrame);
                
                //share menu twitter - can't recycle
                $("#twitter_share_button").empty();
                var twitterFrame = $(shareMenuTemplate({"id":"bttvTwitterIframe", "channel": chan, "displayName": jsnTeam[i].channel.display_name, "game": jsnTeam[i].channel.meta_game}));
                $("#twitter_share_button").append(twitterFrame);
                
                checkIsFollowing();
                checkIfHasSubs();
                
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
                debug.log("is following checked failed");
                
                if(d.status == 404) {
                    debug.log(vars.userData.login+" is not following "+chan);
                    $("#bttvFollowButton").show();
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
            debug.log(chan+" subs check failed");
            
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
                    $("#subscribe_action").show();
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
}