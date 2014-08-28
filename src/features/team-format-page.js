var debug = require("../debug"),
vars = require("../vars"),
loadTeam = require("./team-load-team");

module.exports = function () {

	if(bttv.settings.get("formatTeamPage") !== true || $("body").attr("data-page") != "teams#show") return;
	debug.log("Formatting team page");

	//add jquery ui for custom tooltips on live channel buttons (adds stream preview images)
	var jquicss = $("<link>", {"href":"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/dark-hive/jquery-ui.min.css", "type":"text/css", "rel":"stylesheet"});
	var jquijs  = $("<script>", {"src":"//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js", "type":"text/javascript"});
	
	//add the bttv css
	var teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
	if(bttv.settings.get("darkenedMode") === true){
		teamCSS = $("<link>", {"href":"//cdn.betterttv.net/style/stylesheets/betterttv-team-page-dark.css?"+bttv.info.versionString(), "id":"betterTwitchTeams", "rel":"stylesheet", "type":"text/css"});
	}
	$('body').append(jquicss, jquijs, teamCSS);

	//remove "Members" text below team logo
	$("h2").remove();

	//move team banner into info section and center
	var imgw = $("#banner_header").find("img").width();
	var dif = ($("#banner_header").width() - imgw) / 2;
	$("#about").prepend($("#banner_header").css({"margin":"0px 0px 0px "+dif+"px"}));

	//make the div relative (but don't move it) so we can position buttons within absolutely
	$("#stats_and_description").css("position", "relative");

	//add follow team button
	var ft = $("<a>", {"id":"followteambtn", "data-ember-action":"135", "class":"js-follow follow button primary action"});
	ft.text("Follow The Whole Team");
	ft.click(function(e){
		followteam();
	});
	$("#team_logo").after(ft);

	//add chat holder
	var ch = $(window).height() - 100;
	var nd = $("<div>", {"id":"team_chat", "style":"width:343px; height:"+ch+"px; float:left; margin:20px 0px 0px 20px;"});
	$(".wrapper.c12.clearfix").append(nd);

	//for w/e reason i can't open the share menu from the share btn onclick, i have to hook the doc click
	$(document).click(function(e){
		if(e.target.id =="sharebtn"){
			var o = $(e.target).offset();
			//above
			//var aleft = o.left - 288;
			//var atop = o.top - 235;

			//below
			var aleft = o.left + 1;
			var atop = o.top + 42;

			$("#share").css({"top":atop+"px", "left":aleft+"px"}).toggle("blind");
		}
	});

	//dynamic element sizing
	$(window).resize(function(){
		var w = $(window).width();
		var h = $(window).height();

		var iw = w - 40;
		//set min inner width
		if(iw < 985){
			iw = 985;
		}
		var pw = iw - 685; //left col + right col + margins = 685

		$("div.main.discovery.team").css({"width":w+"px", "border":"0px solid red", "margin":"auto auto", "padding":"0px 0px 0px 0px"});
		$("div.wrapper.c12.clearfix").css({"width":iw+"px", "border":"0px dashed red", "margin":"auto auto", "padding":"0px 0px 0px 0px"});

		$("#player_column").css({"width":pw+"px", "border":"0px dashed black", "margin":"0px 0px 0px 0px"});
		$("#site_footer").css({"width":pw+"px", "border":"0px dashed black", "margin":"0px 0px 0px 340px"});

		var ar = (pw - 2) / 16; //-2 so when the border is added it fits inside player_column
		var ph = (ar * 9) + 32;
		$("#standard_holder").css({"width":(pw - 2)+"px", "height":ph+"px"});

		var imgw = $("#banner_header").find("img").width();
		var dif = ($("#banner_header").width() - imgw) / 2;
		$("#banner_header").find("img").css({"margin":"0px 0px 40px "+dif+"px"});

		if($("#team_chat").length){
			var ch = ( $("#live_player").height() - 2);
			$("#team_chat").css("height", ch+"px");
		}

		var tmh = ( ($("#live_player").height() - $("#team_logo").height()) - 76 );
		$("#team_member_list").css({"height":tmh+"px"});
	});

	//clear all the twitch timers for loading member list, selected chan info, etc
	var maxId = setTimeout(function(){}, 0);
	for(var i=0; i < maxId; i+=1) { 
    		clearTimeout(i);
	}

	//get the currently selected channel at page load
	var chan = $(".js-playing").attr("id");
	chan = chan.replace("channel_", "");
	vars.teamCurrentChannel = chan;
	vars.teamFirstLoad = 0;
	setTimeout(loadTeam, 500);

	var followlist = "none";
	var uname = cookie.get("login");
	function followteam(){
		if(typeof uname === "undefined"){
			alert("You need to log in first!");
		}else{
			followlist = new Array();
			vars.jsnTeam.forEach(function(a){
				followlist.push(a.channel.name);
			});
			throttledfollow();
		}
	}
	
	function throttledfollow(){
		if(followlist.length > 0){
			var tchan = followlist[0];
			$("#followteambtn").css({"background-color":"#B9A3E3"});
			$("#followteambtn").text("Following "+tchan+" ...");

			Twitch.api.put("/kraken/users/"+uname+"/follows/channels/"+tchan)
			.done(function(d){
				debug.log("follow success for:"+tchan);
				$("#followteambtn").css({"background-color":"green"});
				$("#followteambtn").text("Followed "+tchan);
				if(tchan == vars.jsnTeam[vars.jsnTeam.length - 1].channel.name){
					setTimeout(followlistcomplete, 1000);
				}
				followlist.splice(0, 1);
				setTimeout(throttledfollow, 200);
			})
			.fail(function(a, b, c){
				debug.log("follow failed for:"+tchan);
				if(a.responseJSON && a.responseJSON.message){
					debug.log("follow for "+tchan+" failed:"+a.responseJSON.message);
					$("#followteambtn").text(a.responseJSON.message).css({"background-color":"red"});
				}else{
					debug.log("follow failed for "+tchan+" - "+c);
					$("#followteambtn").text("Follow Failed For "+tchan+" - "+b).css({"background-color":"red"});
				}
				followlist.splice(0, 1);
				setTimeout(throttledfollow, 5000);
			});
		}
	}

	function followlistcomplete(){
		$("#followteambtn").delay(3000).text("Follow Team Complete");
		debug.log("########## Follow Team Function Complete ##########");
	}
}