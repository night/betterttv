var debug = require("../helpers/debug");
    
var pauseHostMode = module.exports = function () {

    if(bttv.settings.get("pauseHostMode") !== true || !window.App) return;
    
    var currentRouteValue = App.__container__.lookup("controller:application").get("currentRouteName");
    
    if(currentRouteValue !== "channel.index") {
    
        //firefox so slow...
        if(currentRouteValue === "loading") {
            setTimeout(pauseHostMode, 500);
        }
        
        return;
    }
    
    var chatController = App.__container__.lookup('controller:chat');
    
    if(typeof chatController.currentRoom !== "undefined" && typeof chatController.currentRoom.tmiRoom !== "undefined") {
        var currentPlayerIsPaused;
    
        chatController.currentRoom.tmiRoom.on("host_target", function(d) {
            currentPlayerIsPaused = $('#player object')[0].isPaused();
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
        setTimeout(pauseHostMode, 500);
    }
}