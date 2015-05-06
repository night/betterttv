var debug = require('../../debug'),
    vars = require('../../vars'),
    buttonTemplate = require('../../templates/team_channel-button'),
    tooltipTemplate = require('../../templates/team_channel-button-tooltip'),
    playingStatsTemplate = require('../../templates/team_now-playing-stats'),
    descAndTitleTemplate = require('../../templates/team_channel-description-and-title'),
    tseInnerTemplate = require('../../templates/team_tse-content-inner-div'),
    loadChannel = require('./team-load-channel');

var loadTeam = module.exports = function() {
    debug.log("Loading team data");
    
    bttv.TwitchAPI.get("/api/team/"+vars.teamName+"/all_channels.json")
    .done(function(d) {
        //debug.log("Team load success");
        vars.teamMembersJson = d.channels;
        
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
        debug.log("Team load fail");
    });
    
    var createButtons = function() {
        $("#bttvTeamMemberListInner").empty();
        
        vars.teamMembersJson.forEach(function(a) {
            var chanName = a.channel.name,
                dispName = a.channel.display_name,
                chanImgUrl = a.channel.image.size50,
                chanGame = a.channel.meta_game,
                chanStatus = a.channel.status,
                chanViews = a.channel.total_views,
                chanViewers = a.channel.current_viewers,
                chanFollowers = a.channel.followers_count,
                chanDesc = a.channel.description,
                chanTitle = a.channel.title,
                theButtonArray = {"name": chanName, "displayName": dispName, "profileImage": chanImgUrl, "tooltip": dispName+" is offline"};
            
            if(chanName === vars.teamCurrentChannel) {
                //update info below player
                $("#bttvNowPlayingStatsHolder").html(playingStatsTemplate({"channel": chanName, "displayName": dispName, "views": chanViews, "viewers": chanViewers, "followers": chanFollowers, "game": chanGame}));
                $("#description").html(descAndTitleTemplate({"description": chanDesc, "title": chanTitle}));
                
                $("#bttvNowPlayingStatsHolder").children().each(function() {
                    $(this).tipsy({"gravity": "s", "fade": true});
                });
                
                theButtonArray["isPlaying"] = true;
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