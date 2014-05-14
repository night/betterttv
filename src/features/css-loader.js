var debug = require('debug');

function cssLoader(cssFileName, functionID){
	if(!document.getElementById(functionID))
	{
		$('head').append('<link rel="stylesheet" href="//cdn.betterttv.net/style/stylesheets/'+cssFileName+'?'+bttv.info.versionString()+'type="text/css" id="'+functionID+'" />')
	}
}
module.exports.cssLoader = cssLoader;