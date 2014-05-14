var debug = require('debug');

function css(cssFileName, functionID){
	if(!document.getElementById(functionID))
	{
		$('body').append('<link rel="stylesheet" href="//cdn.betterttv.net/style/stylesheets/'+cssFileName+'?'+bttv.info.versionString()+'" type="text/css" id="'+functionID+'" />')
	}
}
module.exports.css = css;