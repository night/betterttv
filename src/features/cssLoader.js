var debug = require('debug');

var Loader = function(cssFileName, functionID){
	if(!document.getElementById(functionID))
	{
		$('head').append('<link rel="stylesheet" href="//cdn.betterttv.net/style/stylesheets/'+cssFileName+'?'+bttv.info.versionString()+'type="text/css" id="'+functionID+'" />')
	}
}
exports.Loader = Loader;