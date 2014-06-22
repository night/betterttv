var debug = require('debug');

module.exports = function () {
    if($("body#chat").length || $('body[data-page="ember#chat"]').length) return;

    debug.log("Hide blacklisted channels");

    var channelTest = /^[a-z0-9_-]$/i;
    var blacklistChannels = bttv.settings.get("blacklistChannels").split(" "); // such reloading wow
    for (var i = 0; i < blacklistChannels.length; i++) {
    	var channel = blacklistChannels[i];
    	if (!channelTest.test(channel)) // invalid ignore
    		return;
    	console.log(
    		$('.stream.item > div > a[href="/' + channel.toLowerCase() +'"]').remove());
    }
}