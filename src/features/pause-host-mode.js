var debug = require("../helpers/debug");
    
var pauseHostMode = module.exports = function () {

    if(bttv.settings.get("pauseHostMode") !== true || !window.App) return;
    
    var appController = App.__container__.lookup("controller:application");
    
    if(appController.get("currentRouteName") !== "channel.index") {
        //fookin firefox...
        if(appController.get("currentRouteName") === "loading") {
            debug.log("pause host mode - still loading");
            setTimeout(pauseHostMode, 1000);
        } else {
            debug.log("pause host mode - not channel page");
        }
        return;
    }
    
    var chatController = App.__container__.lookup('controller:chat');
    
    if(typeof chatController.currentRoom !== "undefined" && typeof chatController.currentRoom.tmiRoom !== "undefined") {
        var currentPlayerIsPaused;
    
        chatController.currentRoom.tmiRoom.on("host_target", function(d) {
            currentPlayerIsPaused = $('#player object')[0].isPaused();
            debug.log("host mode toggle, current player paused:"+currentPlayerIsPaused);
        });
        
        $("#channel").bind("DOMNodeInserted", function(event) {
            if(event.target.nodeName == "OBJECT" && currentPlayerIsPaused === true) {
            
                if(event.target.outerHTML.indexOf("auto_play=true") !== -1) {
                    event.target.outerHTML = event.target.outerHTML.replace("auto_play=true", "auto_play=false");
                    debug.log("disabled auto play on host mode toggle");
                }
            }
        });
        
        debug.log("Pause Host Mode Enabled");
    } else {
        debug.log("pause host mode - no current/tmi room");
        setTimeout(pauseHostMode, 1000);
    }
}