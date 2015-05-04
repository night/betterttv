var debug = require('../../debug'),
    vars = require('../../vars'),
    buttonTemplate = require('../../templates/team_channel-button'),
    tooltipTemplate = require('../../templates/team_channel-button-tooltip'),
    descAndTitleTemplate = require('../../templates/team_channel-description-and-title'),
    tseInnerTemplate = require('../../templates/team_tse-content-inner-div'),
    loadChannel = require('./team-load-channel');

var loadTeam = module.exports = function() {
    debug.log("Loading team data");
    
    var theTeam = (window.location.pathname).replace("/team/", "");
    theTeam = theTeam.replace("/event/", "");
    
    bttv.TwitchAPI.get("/api/team/"+theTeam+"/all_channels.json")
    .done(function(d) {
        debug.log("team load success");
        vars.jsnTeam = d.channels;
        
        if(vars.teamFirstLoad === 1) {
            var membersInnerDiv = $(tseInnerTemplate({"id":"bttvTeamMemberListInner"}));
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
        
        vars.jsnTeam.forEach(function(a) {
            var chanName = a.channel.name,
                dispName = a.channel.display_name,
                chanImgUrl = a.channel.image.size50,
                chanGame = a.channel.meta_game,
                chanStatus = a.channel.status,
                chanViewers = a.channel.current_viewers,
                theButtonArray = {"name": chanName, "displayName": dispName, "profileImage": chanImgUrl, "tooltip": dispName+" is offline"};
            
            //update info below player
            if(chanName === vars.teamCurrentChannel) {
                $("#channel_viewer_count").text(chanViewers);
                $("#views_count").text(a.channel.total_views);
                $("#followers_count").text(a.channel.followers_count);
                $("#description").html(descAndTitleTemplate({"description":a.channel.description, "title":a.channel.title}));
            }
            
            if(vars.teamCurrentChannel === chanName) {
                theButtonArray["isPlaying"] = true;
            }
            
            if(chanStatus === "live") {
                var ttTime = new Date().getTime(),
                    ttImgUrl = "//static-cdn.jtvnw.net/previews-ttv/live_user_"+chanName+"-320x200.jpg?"+ttTime;
                    
                if(typeof vars.updatedPreviewUrl !== "undefined") {
                    ttImgUrl = vars.updatedPreviewUrl.replace("CHANNEL", chanName) + "?"+ttTime;
                     debug.log("have updated preview url");
                } else {
                    bttv.TwitchAPI.get("/kraken/streams/featured?limit=1")
                    .done(function(d) {
                        //debug.log("got updated preview url during team load");
                        var targetName = d.featured[0].stream.channel.name;
                        var targetPreviewUrl = d.featured[0].stream.preview;
                        vars.updatedPreviewUrl = targetPreviewUrl.replace(targetName, "CHANNEL");
                    })
                    .fail(function(d) {
                        debug.log("failed getting featured streams for preview url template during team load");
                    });
                }
                
                theButtonArray["viewerCount"] = chanViewers;
                theButtonArray["tooltip"] = tooltipTemplate({"name": dispName, "game": chanGame, "imageUrl": ttImgUrl});
            }
            
            var buttonObject = $(buttonTemplate(theButtonArray));
            buttonObject.click(function(e) {
                loadChannel(chanName); 
            });
            
            buttonObject.tooltip({
                position:{
                    my:"left top",
                    at:"right top"
                },
                content: function() { return $(this).attr("title"); }
            });
            
            $("#bttvTeamMemberListInner").append(buttonObject);
        });
    }
}