var debug = require('../debug'),
vars = require("../vars");

module.exports = function (chan) {
	debug.log("Loading channel "+chan);
	vars.teamCurrentChannel = chan;

	$("div.member.js-playing").removeClass("js-playing");
	$("#channel_"+chan).addClass("js-playing");

	//load video
	$("#standard_holder").empty();
	var player = $("<object>", {"type":"application/x-shockwave-flash", "id":chan+"_video_embed", "style":"width:100%; height:100%;", "wmode":"transparent"});
	player.attr("data", "http://www.twitch.tv/widgets/live_embed_player.swf?channel="+chan);
	var p1 = $("<param>", {"name":"allowFullScreen", "value":"true"});
	var p2 = $("<param>", {"name":"allowScriptAccess", "value":"always"});
	var p3 = $("<param>", {"name":"flashvars", "value":"channel="+chan+"&auto_play=true&start_volume=100"});
	player.append(p1, p2, p3);
	$("#standard_holder").append(player);

	//load chat
	$("#team_chat").empty();
	var a = $("<iframe>", {"id":"chatframe", "frameborder":"0", "scrolling":"no", "height":"100%", "width":"100%", "src":"http://twitch.tv/chat/embed?channel="+chan});
	$("#team_chat").append(a);

	//check if chan has subs
	Twitch.api.get("/api/channels/"+chan+"/product")
	.done(function(d){
		debug.log(chan+" has subs:"+d.price);
		addstoof(d.price);
		checkissubbed();
	})
	.fail(function(d){
		debug.log(chan+" subs check failed");
		if(d.status == 404){
			debug.log(chan+" not in sub program");
		}
		addstoof(0);
	});

	//check to see if user subbed to chan
	function checkissubbed(){
		//debug.log("checking if subbed to chanel");
		var uname = cookie.get("login");

		if(typeof uname !== "undefined"){
			Twitch.api.get("/api/users/"+uname+"/tickets?channel="+chan)
			.done(function(d){
				if((d.tickets).length != 0){
					debug.log(uname+" is subbed to "+chan+" len:"+(d.tickets).length);
					$("#subscribe_action").hide();
					//$("#is-subscribed").show();
				
				}else{
					debug.log(uname+" is not subbed to "+chan);
				}
			})
			.fail(function(d){
				debug.log("check if "+uname+" is subbed to "+chan+" failed");
			});
		}else{
			//debug.log("user not logged in for is subbed check");
		}
	}

	//update all the channel info below the player (stats, description, title, share menu, follow/sub buttons, etc)
	function addstoof(val){
		var jsnTeam = vars.jsnTeam;
		for(var i=0; i<jsnTeam.length; i++){
			if(jsnTeam[i].channel.name == chan){

				$("#channel_url").val("http://www.twitch.tv/"+chan);
				$("#live_embed").val('<object type="application/x-shockwave-flash" height="378" width="620" id="live_embed_player_flash" data="http://www.twitch.tv/widgets/live_embed_player.swf?channel='+chan+'" bgcolor="#000000"><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><param name="allowNetworking" value="all" /><param name="movie" value="http://www.twitch.tv/widgets/live_embed_player.swf" /><param name="flashvars" value="hostname=www.twitch.tv&channel='+chan+'&auto_play=true&start_volume=25" /></object>');

				$("#facebook_like_button").empty();
				var fi = $("<iframe>", {"id":"facebook_like_iframe", "frameborder":"0", "allowtransparency":"true", "src":"http://www.facebook.com/plugins/like.php?href=http://www.twitch.tv/"+chan+"&layout=button_count&show-faces=false&share=false&action=like&width=85&height=21&colorscheme=light", "style":"border:none; overflow:hidden; width:85px; height:21px; position:relative;"});
				$("#facebook_like_button").append(fi);

				$("#twitter_share_button").empty();
				var ta = $("<a>", {"class":"twitter-share-button", "href":"https://twitter.com/share", "data-url":"http://www.twitch.tv/"+chan, "data-text":jsnTeam[i].channel.display_name+" is playing "+jsnTeam[i].channel.meta_game+" at:"});
				ta.text("Tweet");
				var ts = $("<script>", {"src":"http://platform.twitter.com/widgets.js", "type":"text/javascript"});
				$("#twitter_share_button").append(ta, ts);

				var s1 = $("<strong>");
				var s1a = $("<a>", {"id":"live_channel_name", "href":"/"+chan});
				s1a.text(jsnTeam[i].channel.display_name);
				s1.append(s1a);

				var s2 = $("<span>", {"id":"channel_viewer_count", "class":"stat", "style":"margin:0px 0px 0px -3px;"});
				s2.text(jsnTeam[i].channel.current_viewers);

				var s3 = $("<span>", {"id":"views_count", "class":"stat", "style":"margin:0px 0px 0px 5px;"});
				s3.text(jsnTeam[i].channel.total_views+" ");

				var s4 = $("<span>", {"id":"followers_count", "class":"stat"});
				s4.text(jsnTeam[i].channel.followers_count);

				var d = $("<div>", {"id":"description"});
				d.html("<b>Channel Description:</b><br>"+jsnTeam[i].channel.description+"<br><br><b>Broadcast Title:</b><br>"+jsnTeam[i].channel.title);

				$("#stats_and_description").empty();
				var ca	  = $("<div>", {"id":"channel_actions", "style":"position:absolute; top:15px; right:15px;"});
				var fa = $("<a>", {"id":"followbtn", "data-ember-action":"135", "class":"js-follow follow button primary action"});
				fa.text(" Follow ");
				fa.click(function(e){
					followcurrentchannel();
				});
				ca.append(fa);

				var sha   = $("<div>", {"id":"sharebtn", "class":"button action primary"});
				sha.text("Share");
				/* dunno why but this will not show the share menu
				sha.click(function(e){
					debug.log("share button click");
					var o = $(e.target).offset();
					var aleft = o.left + 1;
					var atop = o.top + 42;
					$("#share").css({"top":atop+"px", "left":aleft+"px"}).toggle("blind");
					
				});
				*/

				if(val != 0){
					var caa   = $("<a>", {"id":"subscribe_action", "class":"action button js-sub-button primary subscribe-button", "href":"/"+chan+"/subscribe?ref=below_video_subscribe_button", "target":"_blank"});
					var caas1 = $("<span>", {"class":"subscribe-text"});
					caas1.text("Subscribe");
					var caas2 = $("<span>", {"class":"subscribe-price"});
					caas2.text(val);
					caa.append(caas1, caas2);
					//var isub = $("<span>", {"id":"is-subscribed", "class":"subscribed", "style":"display:none"});
					//var isvg = $("<svg>", {"class":"svg-star", "height":"100%", "version":"1.1", "viewBox":"0 0 16 16", "width":"100%", "x":"0px", "y":"0px"});
					//var ipth = $("<path>", {"clip-rule":"evenodd", "d":"M15,6l-4.041,2.694L13,14l-5-3.333L3,14l2.041-5.306L1,6h5.077L8,1l1.924,5H15z", "fill-rule":"evenodd"});
					//isvg.append(ipth);
					//isub.append(isvg);
					ca.append(caa, sha);
				}else{
					ca.append(sha);
				}

				$("#stats_and_description").append(s1, " playing ", jsnTeam[i].channel.meta_game, "<br>", s2, s3, s4, ca, d);
				$(window).resize();
				break;
			}
		}
		//check if user is following chan
		var uname = cookie.get("login");
		if(typeof uname !== "undefined"){
			Twitch.api.get("/kraken/users/"+uname+"/follows/channels/"+chan)
			.done(function(d){
				debug.log(uname+" is following "+chan);
				$("#followbtn").hide();
			})
			.fail(function(d){
				debug.log("is following checked failed");
				if(d.status == 404){
					debug.log(uname+" is not following "+chan);
				}
			});
		}else{
			//debug.log("user not logged in to check if following");
		}
	}

	function followcurrentchannel(){
		var uname = cookie.get("login");
		if(typeof uname !== "undefined"){
			Twitch.api.put("/kraken/users/"+uname+"/follows/channels/"+chan)
			.done(function(d){
				debug.log(uname+" is now following "+chan);
				$("#followbtn").hide();
			})
			.fail(function(d){
				debug.log(uname+" follow "+chan+" failed");
			});
		}else{
			alert("You need to log in first!");
		}
	}
}