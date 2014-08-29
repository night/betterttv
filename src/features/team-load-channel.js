var debug = require('../debug'),
    vars = require("../vars");

module.exports = function(chan) {
    debug.log("Loading channel "+chan);
    vars.teamCurrentChannel = chan;

    $("div.member.js-playing").removeClass("js-playing");
    $("#channel_"+chan).addClass("js-playing");

    //load video
    $("#standard_holder").empty();
    var p1 = $("<param>", {"name":"allowFullScreen", "value":"true"}),
        p2 = $("<param>", {"name":"allowScriptAccess", "value":"always"}),
        p3 = $("<param>", {"name":"flashvars", "value":"channel="+chan+"&auto_play=true&start_volume=100"}),
        player = $("<object>", {"type":"application/x-shockwave-flash", "id":chan+"_video_embed", "class":"ttvFlashPlayer", "wmode":"transparent"});
    player.attr("data", "http://www.twitch.tv/widgets/live_embed_player.swf?channel="+chan);
    player.append(p1, p2, p3);
    $("#standard_holder").append(player);

    //load chat
    $("#team_chat").empty();
    var chatEmbed = $("<iframe>", {"id":"chatEmbed", "src":"http://twitch.tv/chat/embed?channel="+chan, "frameborder":"0"});
    $("#team_chat").append(chatEmbed);

    //check if chan has subs
    Twitch.api.get("/api/channels/"+chan+"/product")
    .done(function(d) {
        debug.log(chan+" has subs:"+d.price);
        addStoof(d.price);
        checkIsSubbed();
    })
    .fail(function(d) {
        debug.log(chan+" subs check failed");
        
        if(d.status == 404) {
            debug.log(chan+" not in sub program");
        }
        
        addStoof(0);
    });

    var uName = cookie.get("login");

    var checkIsSubbed = function() {
        //debug.log("checking if subbed to chanel");

        if(typeof uName !== "undefined") {

            Twitch.api.get("/api/users/"+uName+"/tickets?channel="+chan)
            .done(function(d) {
            
                if((d.tickets).length != 0) {
                    debug.log(uName+" is subbed to "+chan+" len:"+(d.tickets).length);
                    $("#subscribe_action").hide();
                } else {
                    debug.log(uName+" is not subbed to "+chan);
                }

            })
            .fail(function(d) {
                debug.log("check if "+uName+" is subbed to "+chan+" failed");
            });

        } else {
            //debug.log("user not logged in for isSubbed check");
        }
    }

    //update all the channel info below the player (stats, description, title, share menu, follow/sub buttons, etc)
    var addStoof = function(val) {
        var jsnTeam = vars.jsnTeam;
        
        for(var i=0; i<jsnTeam.length; i++) {
        
            if(jsnTeam[i].channel.name == chan) {
                $("#channel_url").val("http://www.twitch.tv/"+chan);
                $("#live_embed").val('<object type="application/x-shockwave-flash" height="378" width="620" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel='+chan+'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.twitch.tv&channel='+chan+'&auto_play=true&start_volume=25" /></object>');

                $("#facebook_like_button").empty();
                var faceBookFrame = $("<iframe>", {"id":"facebook_like_iframe", "frameborder":"0", "allowtransparency":"true", "src":"http://www.facebook.com/plugins/like.php?href=http://www.twitch.tv/"+chan+"&layout=button_count&show-faces=false&share=false&action=like&width=85&height=21&colorscheme=light"});
                $("#facebook_like_button").append(faceBookFrame);

                $("#twitter_share_button").empty();
                var tweetBtn = $("<a>", {"class":"twitter-share-button", "href":"https://twitter.com/share", "data-url":"http://www.twitch.tv/"+chan, "data-text":jsnTeam[i].channel.display_name+" is playing "+jsnTeam[i].channel.meta_game+" at:"}),
                    tweetJS = $("<script>", {"src":"http://platform.twitter.com/widgets.js", "type":"text/javascript"});
                tweetBtn.text("Tweet");
                $("#twitter_share_button").append(tweetBtn, tweetJS);

                var chanLinkSpan = $("<strong>"),
                    chanLink = $("<a>", {"id":"live_channel_name", "href":"/"+chan});
                chanLink.text(jsnTeam[i].channel.display_name);
                chanLinkSpan.append(chanLink);

                var viewerCount = $("<span>", {"id":"channel_viewer_count", "class":"stat"});
                viewerCount.text(jsnTeam[i].channel.current_viewers);

                var viewsCount = $("<span>", {"id":"views_count", "class":"stat"});
                viewsCount.text(jsnTeam[i].channel.total_views+" ");

                var followersCount = $("<span>", {"id":"followers_count", "class":"stat"});
                followersCount.text(jsnTeam[i].channel.followers_count);

                var descHolder = $("<div>", {"id":"description"});
                descHolder.html("<b>Channel Description:</b><br>"+jsnTeam[i].channel.description+"<br><br><b>Broadcast Title:</b><br>"+jsnTeam[i].channel.title);

                $("#stats_and_description").empty();
                var chanActions = $("<div>", {"id":"channel_actions"}),
                    followBtn = $("<a>", {"id":"followbtn", "data-ember-action":"135", "class":"js-follow follow button primary action"});
                followBtn.text(" Follow ");
                
                followBtn.click(function(e) {
                    followcurrentchannel();
                });
                
                chanActions.append(followBtn);

                var shareBtn   = $("<div>", {"id":"sharebtn", "class":"button action primary"});
                shareBtn.text("Share");
                
                /* dunno why but this will not show the share menu
                shareBtn.click(function(e) {
                    debug.log("share button click");
                    var o = $(e.target).offset();
                    var aLeft = o.left + 1;
                    var aTop = o.top + 42;
                    $("#share").css({"top":aTop+"px", "left":aLeft+"px"}).toggle("blind");
                    
                });
                */

                if(val != 0) {
                    var subBtn = $("<a>", {"id":"subscribe_action", "class":"action button js-sub-button primary subscribe-button", "href":"/"+chan+"/subscribe?ref=below_video_subscribe_button", "target":"_blank"}),
                        subTxt = $("<span>", {"class":"subscribe-text"}),
                        subPrice = $("<span>", {"class":"subscribe-price"});
                    subTxt.text("Subscribe");
                    subPrice.text(val);

                    subBtn.append(subTxt, subPrice);
                    chanActions.append(subBtn, shareBtn);
                } else {
                    chanActions.append(shareBtn);
                }

                $("#stats_and_description").append(chanLinkSpan, " playing ", jsnTeam[i].channel.meta_game, "<br>", viewerCount, viewsCount, followersCount, chanActions, descHolder);
                $(window).resize();
                break;
            }
        }
        
        //check if user is following chan
        if(typeof uName !== "undefined") {
        
            Twitch.api.get("/kraken/users/"+uName+"/follows/channels/"+chan)
            .done(function(d) {
                debug.log(uName+" is following "+chan);
                $("#followbtn").hide();
            })
            .fail(function(d) {
                debug.log("is following checked failed");
                
                if(d.status == 404) {
                    debug.log(uName+" is not following "+chan);
                }

            });
            
        } else {
            //debug.log("user not logged in to check if following");
        }
    }

    var followcurrentchannel = function() {
        
        if(typeof uName !== "undefined") {
        
            Twitch.api.put("/kraken/users/"+uName+"/follows/channels/"+chan)
            .done(function(d){
                debug.log(uName+" is now following "+chan);
                $("#followbtn").hide();
            })
            .fail(function(d){
                debug.log(uName+" follow "+chan+" failed");
            });
            
        } else {
            alert("You need to log in first!");
        }
    }
}