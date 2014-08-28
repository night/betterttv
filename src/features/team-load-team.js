var debug = require('../debug'),
vars = require('../vars'),
loadchannel = require('./team-load-channel');

module.exports = function loadTeam(){
	debug.log("Loading team data");

	var TheTeam = (window.location.pathname).replace("/team/", "");
	Twitch.api.get("/api/team/"+TheTeam+"/all_channels.json")
	.done(function(d){
		//debug.log("team loaded successfully");
		vars.jsnTeam = d.channels;
		createbuttons();
		setTimeout(loadTeam, 60000);
		if(vars.teamFirstLoad == 0){
			//need to update chan info and load chat on page load
			loadchannel(vars.teamCurrentChannel);
			vars.teamFirstLoad = 1;
		}
		
	})
	.fail(function(data){
		debug.log("team load failed");
		setTimeout(loadTeam, 10000);
	});

	function createbuttons(){
		//debug.log("creating buttons");
		$("#team_member_list").empty();
		vars.jsnTeam.forEach(function(a){
			var cname	= a.channel.name;
			var dname	= a.channel.display_name;
			var image	= a.channel.image.size50; //600,300,150,70,50,28
			var title	= a.channel.title;
			var game	= a.channel.meta_game;
			var status	= a.channel.status; //live or offline
			var desc	= a.channel.description;
			var followers	= a.channel.followers_count;
			var views	= a.channel.total_views;
			var viewers	= a.channel.current_viewers;

			var d = $("<div>", {"id":"channel_"+cname, "class":"member", "style":"cursor:pointer", "title":dname+" is offline"});
			d.click(function(e){
				loadchannel(cname);	
			});
			if(status == "live"){
				d.addClass("live");

				var time = new Date().getTime();
				var ttimgurl = "http://static-cdn.jtvnw.net/previews-ttv/live_user_"+cname.toLowerCase()+"-320x200.jpg?"+time;
				d.attr("title", dname+" playing "+game+"<br><img src='"+ttimgurl+"' style='width:300px; height:188px;'></img>");
				d.tooltip({
					show:{
						effect: "fold",
						duration: 350,
						delay: 500
					},
					hide:{
						effect: "fold",
						duration: 350,
						delay: 500
					},
		
					position:{
						my:"left top",
						at:"right top"
						//collision: "flipfit"
					},
					content: function(){return $(this).attr("title");}
				});
			}
			if(vars.teamCurrentChannel == cname){
				d.addClass("js-playing");
			}

			var s = $("<span>", {"class":"channel_count small", "style":"margin:30px 5px 0px 0px;"});
			s.text(viewers);
			var si = $("<img>", {"src":"http://www-cdn.jtvnw.net/images/xarth/g/g16_live_viewers.png", "class":"viewers_icon", "style":"margin:30px 5px 0px 0px;"});

			var s2 = $("<div>", {"width":"100%"});
			var i = $("<img>", {"src":image, "style":"margin:10px; border:1px solid black;"});
			var s3 = $("<span>", {"class":"member_name", "style":"margin:0px 0px 0px 5px; line-height:72px; font-size:14px;"});
			s3.text(dname);
			s2.append(i, s3);

			if(status == "live"){
				d.append(s, si, s2);
			}else{
				d.append(s2);
			}
			$("#team_member_list").append(d);
		});
	}
}