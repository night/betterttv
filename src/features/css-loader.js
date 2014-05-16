var debug = require('debug');
function css(cssFileName, functionID){
    if(bttv.settings.get("PrivateChatRemoval") == true){
        $('body').append('<link rel="stylesheet" href="//cdn.betterttv.net/style/stylesheets/'+cssFileName+'?'+bttv.info.versionString()+'" type="text/css" id="'+functionID+'" />');
    }
}
function unload(functionID){
    if (document.getElementById(functionID))
    {
        $('#'+functionID).remove();
    }
}
module.exports.css = css;
module.exports.unload = unload; 