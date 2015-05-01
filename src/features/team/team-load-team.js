var debug = require('../../debug'),
    vars = require('../../vars'),
    loadChannel = require('./team-load-channel');

var loadTeam = module.exports = function() {
    debug.log("Loading team data");
    
    var theTeam = (window.location.pathname).replace("/team/", "");
    theTeam = theTeam.replace("/event/", "");
    
    var hardPreviewUrl = "http://static-cdn.jtvnw.net/previews-ttv/live_user_CHANNEL-320x200.jpg",
        updatedPreviewUrl = "none";
        
    bttv.TwitchAPI.get("/api/team/"+theTeam+"/all_channels.json")
    .done(function(d) {
        debug.log("team load success");
        vars.jsnTeam = d.channels;
        
        if(vars.teamFirstLoad === 1) {
            var membersInnerDiv = $("<div>", {"id":"bttvTeamMemberListInner", "class":"tse-content"});
            $("#team_member_list").addClass("scroll").empty().append(membersInnerDiv);
            $("#team_member_list").TrackpadScrollEmulator({scrollbarHideStrategy: "rightAndBottom"});
        
            loadChannel(vars.teamCurrentChannel);
            vars.teamFirstLoad = 0;
            var bttvLoadTeamInterval = window.setInterval(loadTeam, 60000);
        }
        
        createButtons();
    })
    .fail(function(data) {
        debug.log("team load fail");
    });
    
    var createButtons = function() {
        $("#bttvTeamMemberListInner").empty();
        //todo: make a jade template for the buttons

        vars.jsnTeam.forEach(function(a) {
            var chanName = (a.channel.name).toLowerCase(),
                dispName = a.channel.display_name,
                chanImgUrl = a.channel.image.size50,
                chanGame = a.channel.meta_game,
                chanStatus = a.channel.status,
                chanViewers = a.channel.current_viewers,
                newDiv = $("<div>", {"id":"bttvTeamChannelButton_"+chanName, "class":"member", "title":dispName+" is offline"});
            
            //update since we have fresh data
            if(chanName === vars.teamCurrentChannel) {
                debug.log("updating current channel info");
                $("#channel_viewer_count").text(chanViewers);
                $("#views_count").text(a.channel.total_views);
                $("#followers_count").text(a.channel.followers_count);
                //todo: jade template?
                $("#description").html("<b>Channel Description:</b><br>"+a.channel.description+"<br><br><b>Broadcast Title:</b><br>"+a.channel.title);
            }
            
            newDiv.click(function(e) {
                loadChannel(chanName); 
            });
            
            if(vars.teamCurrentChannel === chanName) {
                newDiv.addClass("js-playing");
            }
            
            if(chanStatus === "live") {
                newDiv.addClass("live");

                var ttTime = new Date().getTime(),
                    //just in case we haven't been able to grab the template yet
                    ttImgUrl = "http://static-cdn.jtvnw.net/previews-ttv/live_user_"+chanName+"-320x200.jpg?"+ttTime;
                    
                if(typeof vars.updatedPreviewUrl !== "undefined") {
                    ttImgUrl = vars.updatedPreviewUrl.replace("CHANNEL", chanName) + "?"+ttTime;
                }
                newDiv.attr("title", dispName+" playing "+chanGame+"<br><img src='"+ttImgUrl+"' class='ttImg' />");
                
                newDiv.tooltip({
                    show:{
                        effect: "fold",
                        duration: 350,
                        delay: 500
                    },
                    hide:{
                        effect: "fold",
                        duration: 350,
                        delay: 500
                    },
                    position:{
                        my:"left top",
                        at:"right top"
                    },
                    content: function() { return $(this).attr("title"); }
                });
            }
            
            var countSpan = $("<span>", {"class":"channel_count small"}),
                countImg = $("<img>", {"src":"http://www-cdn.jtvnw.net/images/xarth/g/g16_live_viewers.png", "class":"viewers_icon"}),
                chanInfoHolder = $("<div>", {"class":"chanBtnChanInfoHolder"}),
                chanImg = $("<img>", {"src":chanImgUrl, "class":"chanBtnChanImg"}),
                chanNameSpan = $("<span>", {"class":"member_name"});
            
            countSpan.text(chanViewers);
            chanNameSpan.text(dispName);
            chanInfoHolder.append(chanImg, chanNameSpan);

            if(chanStatus === "live") {
                chanInfoHolder.append(countSpan, countImg, chanInfoHolder);
            }
            
            newDiv.append(chanInfoHolder);
            $("#bttvTeamMemberListInner").append(newDiv);
        });
    }
}