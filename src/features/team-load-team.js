var debug = require('../debug'),
    vars = require('../vars'),
    loadChannel = require('./team-load-channel');

var loadTeam = module.exports = function() {
    debug.log("Loading team data");

    var theTeam = (window.location.pathname).replace("/team/", "");

    Twitch.api.get("/api/team/"+theTeam+"/all_channels.json")
    .done(function(d) {
        //debug.log("team loaded successfully");
        vars.jsnTeam = d.channels;
        createButtons();
        setTimeout(loadTeam, 60000);
        
        if(vars.teamFirstLoad == 1) {
            loadChannel(vars.teamCurrentChannel);
            vars.teamFirstLoad = 0;
        }
    })
    .fail(function(data) {
        debug.log("team load failed");
        setTimeout(loadTeam, 10000);
    });

    var createButtons = function() {
        //debug.log("creating buttons");
        $("#team_member_list").empty();

        vars.jsnTeam.forEach(function(a) {
            var chanName = (a.channel.name).toLowerCase(),
                dispName = a.channel.display_name,
                chanImgUrl = a.channel.image.size50,
                chanGame = a.channel.meta_game,
                chanStatus = a.channel.status,
                chanViewers = a.channel.current_viewers,
                newDiv = $("<div>", {"id":"channel_"+chanName, "class":"member", "title":dispName+" is offline"});
            
            newDiv.click(function(e) {
                loadChannel(chanName); 
            });
            
            if(chanStatus == "live") {
                newDiv.addClass("live");

                var ttTime = new Date().getTime(),
                    ttImgUrl = "http://static-cdn.jtvnw.net/previews-ttv/live_user_"+chanName+"-320x200.jpg?"+ttTime;
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
                        //collision: "flipfit"
                    },
                    content: function() { return $(this).attr("title"); }
                });
            }
            
            if(vars.teamCurrentChannel == chanName) {
                newDiv.addClass("js-playing");
            }

            var countSpan = $("<span>", {"class":"channel_count small"}),
                countImg = $("<img>", {"src":"http://www-cdn.jtvnw.net/images/xarth/g/g16_live_viewers.png", "class":"viewers_icon"}),
                chanInfoHolder = $("<div>", {"class":"chanBtnChanInfoHolder"}),
                chanImg = $("<img>", {"src":chanImgUrl, "class":"chanBtnChanImg"}),
                chanNameSpan = $("<span>", {"class":"member_name"});
            
            countSpan.text(chanViewers);
            chanNameSpan.text(dispName);
            chanInfoHolder.append(chanImg, chanNameSpan);

            if(chanStatus == "live") {
                newDiv.append(countSpan, countImg, chanInfoHolder);
            } else {
                newDiv.append(chanInfoHolder);
            }
            
            $("#team_member_list").append(newDiv);
        });
    }
}