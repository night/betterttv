var debug = require('debug');
function load(cssFileName, key){
    if(bttv.settings.get(key) == true){
        $('body').append('<link rel="stylesheet" href="//cdn.betterttv.net/style/stylesheets/'+cssFileName+'?'+bttv.info.versionString()+'" type="text/css" id="'+key+'" />');
    }
}
function unload(key){
    if (document.getElementById(key))
    {
        $('#'+key).remove();
    }
}
module.exports.load = load;
module.exports.unload = unload; 