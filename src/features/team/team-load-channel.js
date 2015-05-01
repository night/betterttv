var debug = require('../../debug'),
    vars = require("../../vars");

module.exports = function(val) {
    debug.log("Loading channel "+val);
    
    $("div.member.js-playing").removeClass("js-playing");
    $("#bttvTeamChannelButton_"+val).addClass("js-playing");
    $("#bttvFollowButton").removeClass("bttv-team-follow-success bttv-team-follow-fail bttv-team-follow-processing")
    
    vars.teamCurrentChannel = val;
    
    var loadVideo = function(chan) {
        $("#standard_holder").empty();
        var p1 = $("<param>", {"name":"allowFullScreen", "value":"true"}),
            p2 = $("<param>", {"name":"allowNetworking", "value":"all"}),
            p3 = $("<param>", {"name":"allowScriptAccess", "value":"always"}),
            p4 = $("<param>", {"name":"flashvars", "value":"channel="+chan+"&auto_play=true"}),
            player = $("<object>", {"type":"application/x-shockwave-flash", "id":chan+"_video_embed", "class":"ttvFlashPlayer", "wmode":"transparent"});
        player.attr("data", "//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf");
        player.append(p1, p2, p3, p4);
        $("#standard_holder").append(player);
    }
    
    var loadChat = function(chan) {
        $("#bttvTeamChat").empty();
        var chatEmbed = $("<iframe>", {"id":"chatEmbed", "src":"http://www.twitch.tv/"+chan+"/chat", "frameborder":"0"});
        $("#bttvTeamChat").append(chatEmbed);
    }
    
    var loadChannelInfo = function(chan) {
        var jsnTeam = vars.jsnTeam;
        
        for(var i=0; i<jsnTeam.length; i++) {
            if(jsnTeam[i].channel.name === chan) {
                //info below player - hooray for recycling! lol
                $("#channel_viewer_count").text(jsnTeam[i].channel.current_viewers);
                $("#views_count").text(jsnTeam[i].channel.total_views);
                $("#followers_count").text(jsnTeam[i].channel.followers_count);
                $("#description").html("<b>Channel Description:</b><br>"+jsnTeam[i].channel.description+"<br><br><b>Broadcast Title:</b><br>"+jsnTeam[i].channel.title);
                $("#live_channel_name").attr("href", "/"+chan).text(jsnTeam[i].channel.display_name+" playing "+jsnTeam[i].channel.meta_game);
                
                //update share menu
                $("#channel_url").val("http://www.twitch.tv/"+chan);
                //$("#live_embed").val('<object type="application/x-shockwave-flash" height="378" width="620" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel='+chan+'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.twitch.tv&channel='+chan+'&auto_play=true&start_volume=25" /></object>');
                $("#live_embed").val('<object type="application/x-shockwave-flash" height="378" width="620" data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" /><param name="flashvars" value="channel='+chan+'&auto_play=true&start_volume=25" /></object>');
                
                //share menu facebook
                $("#facebook_like_iframe").attr("src", "http://www.facebook.com/plugins/like.php?href=http://www.twitch.tv/"+chan+"&layout=button_count&show-faces=false&share=false&action=like&width=85&height=21&colorscheme=light");

                //share menu twitter - can't recycle
                $("#twitter_share_button").empty();
                var twitterFrame = $("<iframe>", {"id":"bttvTwitterIframe", "scrolling":"no", "frameborder":"0", "src":"https://platform.twitter.com/widgets/tweet_button.html?size=s&align=right&url=http://www.twitch.tv/"+chan+"&text="+jsnTeam[i].channel.display_name+" is playing "+jsnTeam[i].channel.meta_game+" at:"});
                $("#twitter_share_button").append(twitterFrame);
                
                break;
            }
        }
    }
    
    var checkIsFollowing = function(chan) {
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
    
    var checkIfHasSubs = function(chan) {
        bttv.TwitchAPI.get("/api/channels/"+chan+"/product")
        .done(function(d) {
            debug.log(chan+" has subs:"+d.price);
            checkIsSubbed(chan, d.price);
        })
        .fail(function(d) {
            debug.log(chan+" subs check failed");
            
            if(d.status == 404) {
                debug.log(chan+" not in sub program");
                $("#subscribe_action").hide();
            }
        });
    }
    
    var checkIsSubbed = function(chan, price) {
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
    
    //you said you wanted me to use more functions. am i being too literal in this case?
    loadVideo(val);
    loadChat(val);
    loadChannelInfo(val);
    checkIsFollowing(val);
    checkIfHasSubs(val);
    //or should i just execute it as in the comment block below?
    //i mean it's all going to be executed for each channel load anyways
    
    /* 
    $("div.member.js-playing").removeClass("js-playing");
    //$("#channel_"+val).addClass("js-playing");
    $("#bttvTeamChannelButton_"+chan).addClass("js-playing");
    
    vars.teamCurrentChannel = val;
    
    //load video
    $("#standard_holder").empty();
    var p1 = $("<param>", {"name":"allowFullScreen", "value":"true"}),
        p2 = $("<param>", {"name":"allowNetworking", "value":"all"}),
        p3 = $("<param>", {"name":"allowScriptAccess", "value":"always"}),
        p4 = $("<param>", {"name":"flashvars", "value":"channel="+chan+"&auto_play=true"}),
        player = $("<object>", {"type":"application/x-shockwave-flash", "id":chan+"_video_embed", "class":"ttvFlashPlayer", "wmode":"transparent"});
    player.attr("data", "//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf");
    player.append(p1, p2, p3, p4);
    $("#standard_holder").append(player);
    
    //load chat
    $("#bttvTeamChat").empty();
    var chatEmbed = $("<iframe>", {"id":"chatEmbed", "src":"http://www.twitch.tv/"+chan+"/chat", "frameborder":"0"});
    $("#bttvTeamChat").append(chatEmbed);

    //load channel info
    var jsnTeam = vars.jsnTeam;
    for(var i=0; i<jsnTeam.length; i++) {
        if(jsnTeam[i].channel.name === chan) {
            //info below player
            $("#channel_viewer_count").text(jsnTeam[i].channel.current_viewers);
            $("#views_count").text(jsnTeam[i].channel.total_views);
            $("#followers_count").text(jsnTeam[i].channel.followers_count);
            $("#description").html("<b>Channel Description:</b><br>"+jsnTeam[i].channel.description+"<br><br><b>Broadcast Title:</b><br>"+jsnTeam[i].channel.title);
            $("#live_channel_name").attr("href", "/"+chan).text(jsnTeam[i].channel.display_name+" playing "+jsnTeam[i].channel.meta_game);
            
            //update share menu
            $("#channel_url").val("http://www.twitch.tv/"+chan);
            $("#live_embed").val('<object type="application/x-shockwave-flash" height="378" width="620" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel='+chan+'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.twitch.tv&channel='+chan+'&auto_play=true&start_volume=25" /></object>');
            
            //share menu facebook
            $("#facebook_like_button").empty();
            var faceBookFrame = $("<iframe>", {"id":"facebook_like_iframe", "frameborder":"0", "allowtransparency":"true", "src":"http://www.facebook.com/plugins/like.php?href=http://www.twitch.tv/"+chan+"&layout=button_count&show-faces=false&share=false&action=like&width=85&height=21&colorscheme=light"});
            $("#facebook_like_button").append(faceBookFrame);

            //share menu twitter
            $("#twitter_share_button").empty();
            var twitterFrame = $("<iframe>", {"id":"twitter_iframe", "scrolling":"no", "frameborder":"0", "allowtransparency":"true", "src":"https://platform.twitter.com/widgets/tweet_button.html?size=s&url=http://www.twitch.tv/"+chan+"&text="+jsnTeam[i].channel.display_name+" is playing "+jsnTeam[i].channel.meta_game+" at:"});
            $("#twitter_share_button").append(twitterFrame);
            
            break;
        }
    }
    
    var isLoggedIn = vars.userData.isLoggedIn,
        userName = vars.userData.login;
    
    //check if following
    if(isLoggedIn === true) {
        Twitch.api.get("/kraken/users/"+userName+"/follows/channels/"+chan)
        .done(function(d) {
            debug.log(userName+" is following "+chan);
            $("#bttvFollowButton").hide();
        })
        .fail(function(d) {
            debug.log("is following checked failed");
            
            if(d.status == 404) {
                debug.log(userName+" is not following "+chan);
                $("#bttvFollowButton").show();
                
            }
        });
    }
    
    //check if channel in sub program, if so, check if user is subbed
    bttv.TwitchAPI.get("/api/channels/"+chan+"/product")
    .done(function(a) {
        debug.log(chan+" has subs:"+a.price);
        
        if(isLoggedIn === true) {
            bttv.TwitchAPI.get("/api/users/"+userName+"/tickets?channel="+chan)
            .done(function(b) {
                if((b.tickets).length != 0) {
                    debug.log(userName+" is subbed to "+chan+" len:"+(b.tickets).length);
                    $("#subscribe_action").hide();
                } else {
                    debug.log(userName+" is not subbed to "+chan);
                    $("#subscribe_action").show();
                    $(".subscribe-price").text(a.price);
                }
            })
            .fail(function(d) {
                debug.log("check if "+userName+" is subbed to "+chan+" failed");
            });
        }
    })
    .fail(function(d) {
        debug.log(chan+" subs check failed");
        
        if(d.status == 404) {
            debug.log(chan+" not in sub program");
            $("#subscribe_action").hide();
        }
    });
    */
}