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
            $("#bttvTeamMemberListOuter").addClass("scroll").empty().append(membersInnerDiv);
            $("#bttvTeamMemberListOuter").TrackpadScrollEmulator({scrollbarHideStrategy: "rightAndBottom"});
            
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
            
            
            if(chanName === vars.teamCurrentChannel) {
                theButtonArray["isPlaying"] = true;
                
                //update info below player
                $("#channel_viewer_count").text(chanViewers);
                $("#views_count").text(a.channel.total_views);
                $("#followers_count").text(a.channel.followers_count);
                $("#description").html(descAndTitleTemplate({"description":a.channel.description, "title":a.channel.title}));
            }
            
            if(chanStatus === "live") {
                var ttTime = new Date().getTime(),
                    ttImgUrl = "//static-cdn.jtvnw.net/previews-ttv/live_user_"+chanName+"-320x200.jpg?"+ttTime;
                    
                if(typeof vars.updatedPreviewUrl !== "undefined") {
                    ttImgUrl = vars.updatedPreviewUrl.replace("CHANNEL", chanName) + "?"+ttTime;
                } else {
                    bttv.TwitchAPI.get("/kraken/streams/featured?limit=1")
                    .done(function(d) {
                        var targetName = d.featured[0].stream.channel.name;
                        var targetPreviewUrl = d.featured[0].stream.preview;
                        vars.updatedPreviewUrl = targetPreviewUrl.replace(targetName, "CHANNEL");
                    })
                    .fail(function(d) {
                        debug.log("failed getting preview url template during team load");
                    });
                }
                
                theButtonArray["viewerCount"] = chanViewers;
                theButtonArray["tooltip"] = tooltipTemplate({"name": dispName, "game": chanGame, "imageUrl": ttImgUrl});
            }
            
            var buttonObject = $(buttonTemplate(theButtonArray));
            buttonObject.tipsy({"html": true, "gravity": "w", "opacity": 1.0, "fade": true});
            
            buttonObject.click(function(e) {
                loadChannel(chanName); 
            });
            
            $("#bttvTeamMemberListInner").append(buttonObject);
        });
    }
}