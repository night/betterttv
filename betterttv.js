/**
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivs 3.0
 * Unported License. This work is based on BetterJTV (http://betterjtv.com), an unlicensed 
 * work. To view a copy of this license, visit 
 * http://creativecommons.org/licenses/by-nc-nd/3.0/ or send a letter to Creative Commons,
 * 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 * 
 * Contact email: nightwalker@nightdev.com
 */

BetterTTVEngine = function() {

	var betterttvVersion = "6.2 Beta",
		betterttvDebug = {
			log: function(string) { if(window.console && console.log) console.log("BTTV: "+string); },
			warn: function(string) { if(window.console && console.warn) console.warn("BTTV: "+string); },
			error: function(string) { if(window.console && console.error) console.error("BTTV: "+string); },
			info: function(string) { if(window.console && console.info) console.info("BTTV: "+string); }
		},
		currentViewers = [],
		liveChannels = [],
		reloadViewers = false;

	/**
	 * Helper Functions
	 */
	replaceAll = function(m, s1, s2) {
		return m.split(s1).join(s2);
	}

	String.prototype.capitalize = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}

	/**
	 * Core Functions
	 */
	removeElement = function(e) {

		$$(e).each(function(e){ e.remove(); });

	}

	clearAds = function() {

		betterttvDebug.log("Clearing Ads");

		var frontPageAd = document.getElementById("Twitch_FPopaBanner"),
			directoryPageAd = document.getElementById("Twitch_DiropaBanner");

		if(frontPageAd || directoryPageAd || $j(".takeover").length) {
			$j("body").removeClass("takeover");
			$j("body").css("background","url(\"../images/xarth/bg_noise.png\") repeat scroll 0% 0% rgb(38, 38, 38)");
			$j("#mantle_skin").css("background","none");
			window.addEventListener("click", null, false);
			window.removeEventListener("click", null, false);
			window.addEventListener("mouseover", null, false);
			window.removeEventListener("mouseover", null, false);
		}

		if(localStorage.getItem("featured") !== "true") {
			removeElement('.sm_vids');
			removeElement('#nav_games');
			removeElement('#nav_streams');
			removeElement('.featured');
			removeElement('.related');
		}

		if(localStorage.getItem("blocksub") == "true") {
			$j("#sub-details").css("display","none");
		}

		$j('.advertisement, .hide_ad').hide();
      	$j('#right_col').addClass('noads');

	}

	channelReformat = function() {

		// Legacy Function
		// EOL; No more updates

		betterttvDebug.log("Reformatting Channel");

		var player = document.getElementById("player_column"),
			teamPage = document.getElementById("team_member_list"),
			dashboard = document.getElementById("dashboard_title");

		if(!player || teamPage || dashboard) return;

		$j(".main").css({
			background: "none",
			border: "none",
			boxShadow: "none",
			marginTop: "-20px",
			webkitBoxShadow: "none",
			MozBoxShadow: "none"
		});
		$j("#chat_column").css({
			background: "rgba(255, 255, 255, 0.9)",
			borderRadius: "5px",
			marginLeft: "-15px",
			marginTop: "16px",
			padding: "5px",
			webkitBorderRadius: "5px",
			MozBorderRadius: "5px"
		});
		$j("#live_site_player_flash").css({
			height: "395px",
			width: "640px"
		});
		$j("#player_column").css({
			background: "rgba(0, 0, 0, 0.6)",
			color: "#ffffff",
			marginLeft: "-25px",
			marginTop: "15px",
			padding: "5px",
			width: "640px"
		});
		$j("#standard_holder").css({
			height: "395px",
			width: "640px"
		});
		
		$j(".tabs").html('<li target="about" class="tab selected"><a href="#">&nbsp;Info&nbsp;</a></li><li target="archives" class="tab"><a href="/' + PP['channel'] + '/videos">&nbsp;Videos&nbsp;</a></li>');
		$j("#archives").html('');

		if(localStorage.getItem("narrowchat") !== "yes") {
			$j(".c12").css("width","1100px");
			$j("#chat_column").css("width", "410px");
		} else {
			$j(".c12").css("width","1000px");
			$j("#chat_column").css("width", "330px");
		}

		$j("#about").css("display", "inline");

		if(document.getElementById("player_column")) {
			if(document.getElementById("dash_main")) return;
			if(document.getElementById("team_member_list")) return;
			var channelCSS = document.createElement("style");
			channelCSS.setAttribute("type","text/css");
			channelCSS.innerHTML = "#live_channel_name {color:white;} #broadcast_meta #follow_and_filters a { color:#ffffff !important; } #status:focus { color:black !important; } #gameselector_input:focus { color:black !important; } #gameselector_input { color:white; }  #broadcast_meta_edit #status { color: #ffffff; } .gameselector_result_desc { color: #ffffff !important; } .main { background: none !important; } #about a {color:white;text-decoration:underline;} ul.tabs {border-bottom:thin solid #262626;padding-top:5px;padding-left:15px;} ul.tabs li.tab a {color: white; background-color:#262626; border-top-right-radius:5px; margin-left:-10px; margin-top:3px;} ul.tabs li.selected a { border-top-left-radius:5px;border-top-right-radius:5px;margin-left:0px;background-color:#787878;color: #ffffff; margin-top:0px; }";
			$j('body').append(channelCSS);
			if(document.getElementById("facebook_connect")) document.getElementById("facebook_connect").style.background = "none"; document.getElementById("facebook_connect").style.marginBottom = "5px"; document.getElementById("facebook_connect").style.padding = "0px"; document.getElementById("facebook_connect").innerHTML = "&nbsp;";
		}

		if(!document.getElementById("broadcast_meta")) return;
		if(!document.getElementById("vod_form") && document.getElementById("channel_viewer_count") && $j(".betabar").length === 0) {
			document.getElementById("channel_viewer_count").style.background = "url(http://betterttv.nightdev.com/viewers.png) no-repeat";
			document.getElementById("channel_viewer_count").style.backgroundPosition = "0px -1px";
			document.getElementById("views_count").style.background = "url(http://betterttv.nightdev.com/views.png) no-repeat";
			document.getElementById("views_count").style.backgroundPosition = "0px -1px";
			document.getElementById("followers_count").style.background = "url(http://betterttv.nightdev.com/followers.png) no-repeat";
			document.getElementById("followers_count").style.backgroundPosition = "0px -1px";
		}

	}

	directoryReformat = function() {

		betterttvDebug.log("Reformatting Directory");

		if(PP['page_type'] !== "directory") return;

		// Don't need this?

	}

	chatReformat = function() {

		betterttvDebug.log("Reformatting Chat");

		var chat = document.getElementById("chat_lines"),
			channelHeader = document.getElementById("header_banner");

		if(!chat) return;

		if(channelHeader) {
			channelHeader = 125;
		} else {
			channelHeader = 0;
		}

		if(PP['page_type'] == "channel" && $j(".betabar").length === 0) {
			$j("#chat_lines").css({
				fontFamily: "Helvetica, Arial, sans-serif",
				height: channelHeader+450 + "px",
				maxHeight: channelHeader+450 + "px",
				overflowX: "hidden",
				overflowY: "auto",
				width: "100%"
			});
		} else {
			$j("#chat_lines").css({
				fontFamily: "Helvetica, Arial, sans-serif",
				overflowY: "auto",
				overflowX: "hidden"
			});
		}
		
		if($j(".betabar").length) {
			$j("#chat_lines").css({
				paddingRight: "5px"
			});
			$j("#chat_line_list").css({
				fontSize: "13.33333px",
				lineHeight: "17.333333px"
			});
		} else {
			$j("#chat_line_list").css({
				fontSize: "13.33333px",
				lineHeight: "17.333333px",
				width: "100%"
			});
		}

		$j('#chat_loading_spinner').attr('src',"data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");
	
		if(localStorage.getItem("defaulttags") === "true") {
			var originalTags = '<style type="text/css">.line .oldmod { display: inline-block;text-indent: 21px;background-image: url(../images/xarth/g/g18_sword-FFFFFF80.png);background-position: 0 center;background-repeat: no-repeat;display: inline-block;vertical-align: bottom;height: 18px;min-width: 18px;width: expression(document.body.clientWidth < $width ? "18px":"auto");padding: 0;text-indent: -9999px;border-radius: 2px;-moz-border-radius: 2px;-webkit-border-radius: 2px;background-color: #090;overflow: hidden;} .line .oldbroadcaster { display: inline-block;text-indent: 21px;background-image: url(../images/xarth/g/g18_camera-FFFFFF80.png);background-position: 0 center;background-repeat: no-repeat;display: inline-block;vertical-align: bottom;height: 18px;min-width: 18px;width: expression(document.body.clientWidth < $width ? "18px":"auto");padding: 0;text-indent: -9999px;border-radius: 2px;-moz-border-radius: 2px;-webkit-border-radius: 2px;background-color: #090;overflow: hidden;} .line .oldstaff { display: inline-block;text-indent: 21px;background-image: url(../images/xarth/g/g18_wrench-FFFFFF80.png);background-position: 0 center;background-repeat: no-repeat;display: inline-block;vertical-align: bottom;height: 18px;min-width: 18px;width: expression(document.body.clientWidth < $width ? "18px":"auto");padding: 0;text-indent: -9999px;border-radius: 2px;-moz-border-radius: 2px;-webkit-border-radius: 2px;background-color: #090;overflow: hidden;} .line .oldadmin { display: inline-block;text-indent: 21px;background-image: url(../images/xarth/g/g18_badge-FFFFFF80.png);background-position: 0 center;background-repeat: no-repeat;display: inline-block;vertical-align: bottom;height: 18px;min-width: 18px;width: expression(document.body.clientWidth < $width ? "18px":"auto");padding: 0;text-indent: -9999px;border-radius: 2px;-moz-border-radius: 2px;-webkit-border-radius: 2px;background-color: #090;overflow: hidden;}</style>';
			$j('body').append(originalTags);
		}
		
	}

	newChannelReformat = function() {

		betterttvDebug.log("Reformatting Beta Channel Page");

		if($j(".betabar").length === 0) return;

		if(localStorage.getItem("chat_width")) {
			if(localStorage.getItem("chat_width") < 0) {
				localStorage.setItem("chat_width", 0)
			}
		}

		$j('#right_col').append("<div class='resizer' onselectstart='return false;' title='Drag to enlarge chat =D'></vid>");
		$j("#right_col:before").css("margin-left","-1");

		$j(document).ready(function()
		{
			var resize = false;
			
			$j("#right_col .content .bottom #controls #control_buttons .primary_button").css("float","right");
			$j("#right_nav").css({'margin-left' : 'auto','margin-right' : 'auto','width' : '300px','float' : 'none','border' : 'none'});
			$j('#right_col .content .top').css('border-bottom', '1px solid rgba(0, 0, 0, 0.25)')
			
			$j("#right_close").unbind('click');

			if(localStorage.getItem("chat_width")) {
				var chat_width = localStorage.getItem("chat_width");
				$j("#right_col").width(chat_width);
				$j("#right_col .content #chat").width(chat_width);
				$j("#right_col .content .top").width(chat_width);

				var d = 0;
				$j(".fixed").each(function () {
	                d += $j(this).outerWidth()
	            });
	            $j("#main_col").css({
	                width: $j(window).width() - d + "px"
	            });

	            var h = 0.5625 * $j("#main_col").width() - 4;
	            if(h > $j(window).height() - $j("#main_col .top").outerHeight() - 40) {
	            	($j(".live_site_player_container").css({ height: $j(window).height() - $j("#main_col .top").outerHeight() - 40 + "px" }), $j("#main_col .scroll-content-contain").animate({ scrollTop: 90 }, 150, "swing"));
	            } else {
	            	$j(".live_site_player_container").css({ height: h.toFixed(0) + "px" });
	            } 
	            
	            _.debounce(function () {
	            	var d = $j("#broadcast_meta .info .title").width();
		            $j("#broadcast_meta .info .title .real_title").width() > d ? $j("#broadcast_meta .info").addClass("long_title") : $j("#broadcast_meta .info").removeClass("long_title")
		        }, 500)
			} else {
				var chat_width = $j("#right_col").width();
			}
			
			var handleresize = function() {
				var d = 0;
				$j(".fixed").each(function () {
	                d += $j(this).outerWidth()
	            });
	            $j("#main_col").css({
	                width: $j(window).width() - d + "px"
	            });

	            var h = 0.5625 * $j("#main_col").width() - 4;
	            if(h > $j(window).height() - $j("#main_col .top").outerHeight() - 40) {
	            	($j(".live_site_player_container").css({ height: $j(window).height() - $j("#main_col .top").outerHeight() - 40 + "px" }), $j("#main_col .scroll-content-contain").animate({ scrollTop: 90 }, 150, "swing"));
	            } else {
	            	$j(".live_site_player_container").css({ height: h.toFixed(0) + "px" });
	            } 
	            
	            _.debounce(function () {
	            	var d = $j("#broadcast_meta .info .title").width();
		            $j("#broadcast_meta .info .title .real_title").width() > d ? $j("#broadcast_meta .info").addClass("long_title") : $j("#broadcast_meta .info").removeClass("long_title")
		        }, 500)

		        localStorage.setItem("chat_width", $j("#right_col").width());
			}

			$j(document).mouseup(function(event)
			{
				if(resize == false) return;
				if(chat_width_startingpoint) {
					if(chat_width_startingpoint === $j("#right_col").width())  {
						if($j("#right_col").width() !== 0) {
							$j("#right_col").css({
					            width: "0px"
					        });
					        $j("#right_close").css({
					            "background-position": "0 0"
					        });

							handleresize();
						}
					}
				}
				
				resize = false;
				chat_width = $j("#right_col").width();
			});
			
			$j("#right_close").mousedown(function(event)
			{
				resize = event.pageX;
				chat_width = $j("#right_col").width();
				chat_width_startingpoint = chat_width + resize - event.pageX;
				$j("#chat_text_input").focus();
				if($j("#right_col").width() === 0) {
					var d = $j("#right_col .top").width();
			        $j("#right_col").css({
			            width: d + "px"
			        });
			        $j("#right_close").css({
			            "background-position": "0 -18px"
			        });
					
			        handleresize();
				}
			});

			$j("#right_col .resizer").mousedown(function(event)
			{
				resize = event.pageX;
				chat_width = $j("#right_col").width();
				chat_width_startingpoint = chat_width + resize - event.pageX;
				$j("#chat_text_input").focus();
				if($j("#right_col").width() === 0) {
					var d = $j("#right_col .top").width();
			        $j("#right_col").css({
			            width: d + "px"
			        });
			        $j("#right_close").css({
			            "background-position": "0 -18px"
			        });
					
			        handleresize();
				}
			});
		
			$j(document).mousemove(function(event)
			{
				if (resize)
				{
					$j("#chat_text_input").focus();
					if (chat_width + resize - event.pageX < 319)
					{
						$j("#right_col").width(319);
						$j("#right_col .content #chat").width(319);
						$j("#right_col .content .top").width(319);

						handleresize();
					}
					else if (chat_width + resize - event.pageX > 541)
					{
						$j("#right_col").width(541);
						$j("#right_col .content #chat").width(541);
						$j("#right_col .content .top").width(541);

						handleresize();
					}
					else
					{
						$j("#right_col").width(chat_width + resize - event.pageX);
						$j("#right_col .content #chat").width(chat_width + resize - event.pageX);
						$j("#right_col .content .top").width(chat_width + resize - event.pageX);

						handleresize();
					}
				}
			});

			$j(window).resize(function() {
				handleresize();
			});
		});

	}

	brand = function() {

		betterttvDebug.log("Branding Twitch with BTTV logo");

		if($j("#header_logo").length) {
			$j("#header_logo").html("<img alt=\"TwitchTV\" src=\"http://betterttv.nightdev.com/newtwitchlogo.png\">");
			var watermark = document.createElement("div");
			watermark.style.marginTop = "-45px";
			watermark.style.marginLeft = "-8px";
			watermark.innerHTML = "Better";
			watermark.style.color = "#FF0000";
			watermark.style.fontWeight = "bold";
			watermark.style.fontSize = "15px";
			watermark.style.zIndex = "9000";
			watermark.style.opacity = "0.9";
			watermark.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
			watermark.style.textDecoration = "none";
			$j("#header_logo").append(watermark);
		}

		if($j("#logo").length) {
			var watermark = document.createElement("div");
			watermark.style.marginTop = "-10px";
			watermark.style.marginLeft = "38px";
			watermark.innerHTML = "Better";
			watermark.style.color = "#FF0000";
			watermark.style.fontWeight = "bold";
			watermark.style.fontSize = "20px";
			watermark.style.textIndent = "0px";
			watermark.style.zIndex = "9000";
			watermark.style.opacity = "0.9";
			watermark.style.textShadow = "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000";
			watermark.style.textDecoration = "none";
			$j("#logo").append(watermark);
		}

		var growlCSSInject = document.createElement("link");
		growlCSSInject.setAttribute("href","http://betterttv.nightdev.com/jquery.gritter.css");
		growlCSSInject.setAttribute("type","text/css");
		growlCSSInject.setAttribute("rel","stylesheet");
		$j("head").append(growlCSSInject);

		var globalCSSInject = document.createElement("link");
		globalCSSInject.setAttribute("href","http://betterttv.nightdev.com/betterttv.css");
		globalCSSInject.setAttribute("type","text/css");
		globalCSSInject.setAttribute("rel","stylesheet");
		$j("body").append(globalCSSInject);

		meebo();

	}

	checkMessages = function(videopage) {

		betterttvDebug.log("Checking for New Messages");
/*
		if(videopage === true) {
			$j.get('http://www.twitch.tv/inbox', function(data) {
				var messageSender = /class="capital">(.*)<\/a>/i.exec(data);
				var messageSenderAvatar = /http:\/\/static-cdn.jtvnw.net\/jtv_user_pictures\/(.*)-50x50.png/i.exec(data);
				if(messageSender && messageSenderAvatar) {
					messageSender = messageSender[1].capitalize();
					messageSenderAvatar = "http://static-cdn.jtvnw.net/jtv_user_pictures/"+messageSenderAvatar[1]+"-50x50.png";
				} else {
					messageSender = "Someone";
					messageSenderAvatar = "";
				}
				if(PP['notifications'] !== (data.split("unread").length - 2) && PP['notifications'] !== "10+" && PP['notifications'] < (data.split("unread").length - 2)) {
					$j.gritter.add({
				        title: 'Message Received',
				        class_name: 'gritter-light',
				        image: messageSenderAvatar,
				        text: messageSender+' just sent you a Twitch Message!<br /><br /><a style="color:black" href="http://www.twitch.tv/inbox">Click here to head to to your inbox</a>.',
				    });
				}
				PP['notifications'] = (data.split("unread").length - 2);
				if(PP['notifications'] == 10) PP['notifications'] = "10+";
				if(PP['notifications'] !== 0) {
					if(document.getElementById("messagescount")) {
						document.getElementById("messagescount").innerHTML = PP['notifications'];
					} else {
						messagesnum = document.createElement("a");
						user_display_name = document.getElementById("user_display_name");
						messagesnum.setAttribute("id","messagescont");
						messagesnum.setAttribute("href","/inbox");
						messagesnum.setAttribute("style","margin-left: 10px;");
						messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(http://www-cdn.jtvnw.net/images/xarth/g/g18_mail-FFFFFF80.png);background-position: 8px -2px;background-repeat: no-repeat;color:white;'>" + PP['notifications'] + "</span>";
						user_display_name.appendChild(messagesnum);
					}
				} else {
					if(document.getElementById("messagescont")) document.getElementById("messagescont").remove();
				}
				setTimeout(function(){checkMessages(true)}, 300000);
			});
		} else {
			$j.get('http://www.twitch.tv/inbox', function(data) {
				var messageSender = /class="capital">(.*)<\/a>/i.exec(data);
				var messageSenderAvatar = /http:\/\/static-cdn.jtvnw.net\/jtv_user_pictures\/(.*)-50x50.png/i.exec(data);
				if(messageSender && messageSenderAvatar) {
					messageSender = messageSender[1].capitalize();
					messageSenderAvatar = "http://static-cdn.jtvnw.net/jtv_user_pictures/"+messageSenderAvatar[1]+"-50x50.png";
				} else {
					messageSender = "Someone";
					messageSenderAvatar = "";
				}
				if(PP['notifications'] !== (data.split("unread").length - 2) && PP['notifications'] !== "10+" && PP['notifications'] < (data.split("unread").length - 2)) {
					$j.gritter.add({
				        title: 'Message Received',
				        class_name: 'gritter-light',
				        image: messageSenderAvatar,
				        text: messageSender+' just sent you a Twitch Message!<br /><br /><a style="color:black" href="http://www.twitch.tv/inbox">Click here to head to to your inbox</a>.',
				    });
				}
				PP['notifications'] = (data.split("unread").length - 2);
				if(PP['notifications'] == 10) PP['notifications'] = "10+";
				if(PP['notifications'] !== 0) {
					if(document.getElementById("messagescount")) {
						document.getElementById("messagescount").innerHTML = PP['notifications'];
					} else {
						messagesnum = document.createElement("a");
						header_following = document.getElementById("header_following");
						messagesnum.setAttribute("id","messagescont");
						messagesnum.setAttribute("href","/inbox");
						messagesnum.setAttribute("class","normal_button");
						messagesnum.setAttribute("style","margin-right: 10px;");
						messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(http://betterttv.nightdev.com/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + PP['notifications'] + "</span>";
						header_following.parentNode.insertBefore(messagesnum, header_following);
					}
				} else {
					if(document.getElementById("messagescont")) document.getElementById("messagescont").remove();
				}
			});
			setTimeout(function(){checkMessages(false)}, 300000);
		}
		*/
		if(Twitch.user.isLoggedIn() && window.FirebaseRootNamespaced) {
			PP['notifications'] = false;
	        window.FirebaseRootNamespaced.child("users/" + Twitch.user.userId() + "/messages").on("value", function (f, g) {
	        	var f = f.val() || {}, j = f.unreadMessagesCount;
	            $j(".js-unread_message_count").html("<img src='http://www-cdn.jtvnw.net/images/xarth/g/g18_mail-FFFFFF80.png' /> "+j || "");
	            j ? $j(".js-unread_message_count").show() : $j(".js-unread_message_count").hide();
	            if(PP['notifications'] && PP['notifications'] < j) {
	            	$j.get('http://www.twitch.tv/inbox', function(data) {
						var messageSender = /class="capital">(.*)<\/a>/i.exec(data);
						var messageSenderAvatar = /http:\/\/static-cdn.jtvnw.net\/jtv_user_pictures\/(.*)-50x50.png/i.exec(data);
						if(messageSender && messageSenderAvatar) {
							messageSender = messageSender[1].capitalize();
							messageSenderAvatar = "http://static-cdn.jtvnw.net/jtv_user_pictures/"+messageSenderAvatar[1]+"-50x50.png";
						} else {
							messageSender = "Someone";
							messageSenderAvatar = "";
						}
						$j.gritter.add({
					        title: 'Message Received',
					        class_name: 'gritter-light',
					        image: messageSenderAvatar,
					        text: messageSender+' just sent you a Twitch Message!<br /><br /><a style="color:black" href="http://www.twitch.tv/inbox">Click here to head to to your inbox</a>.',
					    });
					});
	            	PP['notifications'] = j;
	            } else {
	            	PP['notifications'] = j;
	            }
	            if(PP['notifications'] > 0 && document.getElementById("header_logo")) {
					if(document.getElementById("messagescount")) {
						document.getElementById("messagescount").innerHTML = PP['notifications'];
					} else {
						messagesnum = document.createElement("a");
						header_following = document.getElementById("header_following");
						messagesnum.setAttribute("id","messagescont");
						messagesnum.setAttribute("href","/inbox");
						messagesnum.setAttribute("class","normal_button");
						messagesnum.setAttribute("style","margin-right: 10px;");
						messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(http://betterttv.nightdev.com/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + PP['notifications'] + "</span>";
						header_following.parentNode.insertBefore(messagesnum, header_following);
					}
				} else {
					if(document.getElementById("messagescont")) document.getElementById("messagescont").remove();
				}
	        });
		}
	}

	meeboReformat = function() {
		
		betterttvDebug.log("Reformatting the Meebo Bar");

		$j('#meebo-googlePlus-plusone-0').remove();
		$j('.meebo-20').remove();
		$j('.meebo-29').remove();
		$j('.meebo-22').replaceWith('<a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=1" style="margin-right:8px;margin-bottom:3px;color:black;" class="normal_button"><span>Report a BetterTTV Bug</span></a><a href="http://www.betterttv.com" style="margin-right:7px;margin-bottom:3px;color:black;" class="normal_button"><span>BetterTTV v'+betterttvVersion+'</span></a>');

	}

	meebo = function() {

		betterttvDebug.log("Handling the Meebo Bar");

		if(localStorage.getItem("hidemeebo") !== "true") {
			$j("#left_col").css("bottom","35px");
			$j("#right_col").css("bottom","35px");
			$j("#directory-list").css("margin-bottom","50px");
			$j("#main_col .content .scroll .scroll-content-contain").css("margin-bottom","35px");
		}

		try {

			if(PP.login != "justin" && localStorage.getItem("hidemeebo") !== "true") {

				window.Meebo||function(c){function p(){return["<",i,' onload="var d=',g,";d.getElementsByTagName('head')[0].",
				j,"(d.",h,"('script')).",k,"='//cim.meebo.com/cim?iv=",a.v,"&",q,"=",c[q],c[l]?
				"&"+l+"="+c[l]:"",c[e]?"&"+e+"="+c[e]:"","'\"></",i,">"].join("")}var f=window,
				a=f.Meebo=f.Meebo||function(){(a._=a._||[]).push(arguments)},d=document,i="body",
				m=d[i],r;if(!m){r=arguments.callee;return setTimeout(function(){r(c)},100)}a.$=
				{0:+new Date};a.T=function(u){a.$[u]=new Date-a.$[0]};a.v=5;var j="appendChild",
				h="createElement",k="src",l="lang",q="network",e="domain",n=d[h]("div"),v=n[j](d[h]("m")),
				b=d[h]("iframe"),g="document",o,s=function(){a.T("load");a("load")};f.addEventListener?
				f.addEventListener("load",s,false):f.attachEvent("onload",s);n.style.display="none";
				m.insertBefore(n,m.firstChild).id="meebo";b.frameBorder="0";b.name=b.id="meebo-iframe";
				b.allowTransparency="true";v[j](b);try{b.contentWindow[g].open()}catch(w){c[e]=
				d[e];o="javascript:var d="+g+".open();d.domain='"+d.domain+"';";b[k]=o+"void(0);"}try{var t=
				b.contentWindow[g];t.write(p());t.close()}catch(x){b[k]=o+'d.write("'+p().replace(/"/g,
				'\\"')+'");d.close();'}a.T(1)}({network:"justin"});
				Meebo.disableAds=true;
				if(PP.login) {
					document.cookie = ["mcim=", PP.login, "&", PP.password_hash, "; path=/; domain=.twitch.tv;"].join('');
				} else {
					eraseCookie("mcim");
				}
				safe_on_load(function() {
					Meebo('domReady');
				});

			}

		} catch(err) { }

	}

	chatFunctions = function() {

		betterttvDebug.log("Modifying Chat Functionality");

		if(!document.getElementById("chat_lines")) return;

		CurrentChat.admin_message("<center><small>BetterTTV v"+ betterttvVersion +" Loaded.</small></center>");

		Chat.prototype.insert_chat_lineOld=Chat.prototype.insert_chat_line;
		Chat.prototype.insert_chat_line=function(info)
		{
			if(info.nickname == "nightbot" && info.message == "> Running a commercial in 15 seconds." && PP['login'] == PP['channel']) {
				$j.gritter.add({
			        title: 'Commercial Warning',
			        class_name: 'gritter-light',
			        time: 10000,
			        image: 'http://cdn.nightdev.com/img/nightboticon.png',
			        text: 'Nightbot will be running a commercial in 15 seconds.',
			    });
			}
			
			if(info.tagtype == "broadcaster") { info.tagname = "Host"; }

			var x=0;
			if(info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin") x=1;
			
			if(localStorage.getItem("defaulttags") === "true") {
				if(info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin" || info.tagtype == "staff") info.tagtype = "old"+info.tagtype;
			}

			if(localStorage.getItem("highlightkeywords")) {
				var highlightKeywords = PP['login'] + " " + localStorage.getItem("highlightkeywords");
				highlightKeywords = highlightKeywords.split(" ");
				highlightKeywords.forEach(function(keyword){
					var regex = new RegExp('\\b'+keyword+'\\b', 'i');
					if(regex.test(info.message) && PP['login'] !== "" && localStorage.getItem("darkchat") === "true") {
						info.color = "#ffffff";
					} else if(regex.test(info.message) && PP['login'] !== "") {
						info.color = "#000000";
					}
				});
			} else {
				var regex = new RegExp('\\b'+PP['login']+'\\b', 'i');
				if(regex.test(info.message) && PP['login'] !== "" && localStorage.getItem("darkchat") === "true") {
					info.color = "#ffffff";
				} else if(regex.test(info.message) && PP['login'] !== "") {
					info.color = "#000000";
				}
			}

			if(info.color == "#0000FF" && localStorage.getItem("darkchat") === "true") { info.color = "#3753ff"; }

			if(info.nickname == "night" && x==1) { info.tagtype="orange"; info.tagname = "Creator"; }
			//Bots
			if(info.nickname == "moobot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "nightbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "nokzbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "sourbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "probot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "saucebot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "bullystopper" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "baconrobot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "mtgbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			
			//Donations
			if(info.nickname == "the_abysss") { info.tagtype="orange"; info.tagname = "god"; }
			if(info.nickname == "gspwar") { info.tagtype="admin"; info.tagname = "EH?"; }
			if(info.nickname == "xnightmare__") { info.tagtype="broadcaster"; info.tagname = "FaZe"; info.nickname="Nightmare"; }
			if(info.nickname == "striker035" && x==1) { info.tagtype="admin"; info.tagname = "MotherLover"; }
			if(info.nickname == "upd0g") { info.tagtype="orange"; info.tagname = "Smelly"; info.nickname="dog"; }
			if(info.nickname == "shadogazer" && x==1) { info.tagtype="purple"; info.tagname = "Daemon"; }
			if(info.nickname == "top_sgt" && x==1) { info.tagtype="mod"; info.tagname = "Soldier"; }
			if(info.nickname == "jrux2011" && x==1) { info.tagtype="bot"; info.tagname = "Design"; }
			if(info.nickname == "standofft_money" && x==1) { info.tagtype="broadcaster"; info.tagname = "iBad"; }
			if(info.nickname == "infemeth" && x==1) { info.tagtype="purple"; info.tagname = "Designer"; }
			if(info.nickname == "totally_cereal" && x==1) { info.tagtype="staff"; info.tagname = "Fruity"; }
			if(info.nickname == "tomyfreidz" && x==1) { info.tagtype="broadcaster"; info.tagname = "<span style='color:#00F2FF;'>Designer</span>"; }
			if(info.nickname == "virtz" && x==1) { info.tagtype="staff"; info.tagname = "Perv"; }
			if(info.nickname == "unleashedbeast" && x==1) { info.tagtype="admin"; info.tagname = "<span style='color:black;'>Surface</span>"; }
			if(info.nickname == "kona" && x==1) { info.tagtype="broadcaster"; info.tagname = "KK"; }
			if(info.nickname == "norfolk_en_clue" && x==1) { info.tagtype="broadcaster"; info.tagname = "Creamy"; }
			if(info.nickname == "onyxblade" && x==1) { info.tagtype="bot"; info.tagname = "Onyx"; }
			if(info.nickname == "aromaticyeti" && x==1) { info.tagtype="bot"; info.tagname = "Onyx"; }
			if(info.nickname == "leftyben" && x==1) { info.tagtype="lefty"; info.tagname = "&nbsp;"; }
			if(info.nickname == "maximusloopus" && x==1) { info.tagtype="admin"; info.tagname = "<span style='color:black;'>Hero</span>"; }
			if(info.nickname == "nokz" && x==1) { info.tagtype="staff"; info.tagname = "N47"; }
			if(info.nickname == "blindfolded" && x==1) { info.tagtype="broadcaster"; info.tagname = "iLag"; }
			if(info.nickname == "jjag72" && x==1) { info.tagtype="admin"; info.tagname = "Jag"; }
			if(info.nickname == "snorlaxitive" && x==1) { info.tagtype="purple"; info.tagname = "King"; }
			if(info.nickname == "excalibr" && x==1) { info.tagtype="staff"; info.tagname = "Boss"; }
			if(info.nickname == "chez_plastic" && x==1) { info.tagtype="staff"; info.tagname = "Frenchy"; }
			if(info.nickname == "frontiersman72" && x==1) { info.tagtype="admin"; info.tagname = "Uni"; }
			if(info.nickname == "dckay14" && x==1) { info.tagtype="admin"; info.tagname = "Ginger"; }
			if(info.nickname == "boogie_yellow" && x==1) { info.tagtype="orange"; info.tagname = "Yellow"; }
			if(info.nickname == "harksa" && x==1) { info.tagtype="orange"; info.tagname = "Feet"; }
			if(info.nickname == "lltherocksaysll" && x==1) { info.tagtype="broadcaster"; info.tagname = "BossKey"; }
			if(info.nickname == "melissa_loves_everyone" && x==1) { info.tagtype="purple"; info.tagname = "Chubby"; info.nickname="Bunny"; }
			if(info.nickname == "redvaloroso" && x==1) { info.tagtype="broadcaster"; info.tagname = "Dio"; }
			if(info.nickname == "slapage" && x==1) { info.tagtype="bot"; info.tagname = "I aM"; }
			if(info.nickname == "aclaz_92" && x==1) { info.tagtype="bot"; info.tagname = "412"; }
			if(info.nickname == "deano2518" && x==1) { info.tagtype="orange"; info.tagname = "<span style='color:black;'>WWFC</span>"; }
			if(info.nickname == "eternal_nightmare" && x==1) { info.tagtype="broadcaster"; info.tagname = "Spencer"; info.nickname = "Nickiforek"; }
			if(info.nickname == "iivii_beauty" && x==1) { info.tagtype="purple"; info.tagname = "Crave"; }
			if(info.nickname == "theefrenzy" && x==1) { info.tagtype="staff"; info.tagname = "Handsome"; }
			if(info.nickname == "ashardis" && x==1) { info.tagtype="staff"; info.tagname = "Dat Ash"; }
			if(info.nickname == "gennousuke69" && x==1) { info.tagtype="admin"; info.tagname = "Evil"; }
			if(info.nickname == "yorkyyork") { info.tagtype="broadcaster"; info.tagname = "<span style='color:red;'>FeaR</span>"; }
			if(info.nickname == "sournothardcore" && x==1) { info.tagname = info.tagname+"</span><span class='tag brown' style='margin-left:4px;color:#FFE600 !important;' original-title='Saucy'>Saucy</span><span>"; }
			//People
			if(info.nickname == "mac027" && x==1) { info.tagtype="admin"; info.tagname = "Hacks"; }
			if(info.nickname == "socaldesigner" && x==1) { info.tagtype="broadcaster"; info.tagname = "Legend"; }
			if(info.nickname == "perfectorzy" && x==1) { info.tagtype="mod"; info.tagname = "Jabroni Ave"; }
			if(info.nickname == "pantallideth1" && x==1) { info.tagtype="staff"; info.tagname = "Windmill"; }
			if(info.nickname == "mmmjc" && x==1) { info.tagtype="admin"; info.tagname = "m&m"; }
			if(info.nickname == "hawkeyye" && x==1) { info.tagtype="broadcaster"; info.tagname = "EnVy"; info.nickname="Hawkeye"; }
			if(info.nickname == "paterandreas" && x==1) { info.tagtype="admin"; info.tagname = "Uni-BB"; }
			if(info.nickname == "the_chopsticks" && x==1) { info.tagtype="admin"; info.tagname = "oZn"; }
			if(info.nickname == "whitesammy") { info.color = "white;text-shadow: 0 0 2px #000"; }
			//Xmas
			if(info.nickname == "r3lapse" && x==1) { info.tagtype="staff"; info.tagname = "Kershaw"; }
			if(info.nickname == "im_tony_" && x==1) { info.tagtype="admin"; info.tagname = "oZn"; }
			if(info.nickname == "tips_" && x==1) { info.tagtype="staff"; info.tagname = "241"; }
			if(info.nickname == "papa_dot" && x==1) { info.tagtype="mod"; info.tagname = "v8"; }
			if(info.nickname == "beccamay" && x==1) { info.tagtype="orange"; info.tagname = "British"; }
			if(info.nickname == "1danny1032" && x==1) { info.tagtype="admin"; info.tagname = "1Bar"; }
			if(info.nickname == "cvagts" && x==1) { info.tagtype="staff"; info.tagname = "SRL"; }
			if(info.nickname == "thesabe" && x==1) { info.tagtype="orange"; info.tagname = "<span style='color:blue;'>Sabey</span>"; }
			if(info.nickname == "kerviel_" && x==1) { info.tagtype="staff"; info.tagname = "Almighty"; }
			if(info.nickname == "ackleyman" && x==1) { info.tagtype="orange"; info.tagname = "Ack"; }
			
			this.insert_chat_lineOld(info);
		}

		Chat.prototype.emoticonizeOld = function (a, c) {
	        var b = CurrentChat,
	            e = CurrentChat.emoticons.length;
	        for (i = 0; i < e; i++) {
	            var d = CurrentChat.emoticons[i];
	            if (1 === d.images.length && !d.images[0].emoticon_set) a = a.replace(d.regex, d.images[0].html);
	            else if (a.match(d.regex)) {
	                var g = null,
	                    h = !1;
	                d.images.forEach(function (e) {
	                    if (-1 !== (b.user_to_emote_sets[c] || []).indexOf(e.emoticon_set)) a = a.replace(d.regex, e.html), h = !0;
	                    e.emoticon_set || (g = e.html)
	                });
	                !h && g && (a = a.replace(d.regex, g))
	            }
	        }
	        return a
	    }

		Chat.prototype.emoticonize = function(msg, b) {
			msg = replaceAll(msg, "<wbr />", "");
			msg = this.emoticonizeOld(msg, b);
			if(localStorage.getItem("highlightkeywords")) {
				var highlightKeywords = PP['login'] + " " + localStorage.getItem("highlightkeywords");
				highlightKeywords = highlightKeywords.split(" ");
				var highlight = false;
				highlightKeywords.forEach(function(keyword){
					var regex = new RegExp('\\b'+keyword+'\\b', 'i');
					if(regex.test(msg) && PP['login'] !== "") {
						if(highlight === false) {
							highlight = true;
							if(localStorage.getItem("darkchat") === "true") {
								msg = "<span id='bttvhighlight' style='color:white;font-weight:bold;word-wrap: break-word;'>"+msg+"</span>";
							} else {
								msg = "<span id='bttvhighlight' style='color:black;font-weight:bold;word-wrap: break-word;'>"+msg+"</span>";
							}
							setTimeout(function () {
								$$('#bttvhighlight').each(function(element) {
									$j(element).parent().parent().css({
																'background-color': 'rgba(255,0,0,0.5)',
																'padding': "3px"
															});
								});
			        		}, 1000);
						}
					}
				});
				if(highlight === false) {
					msg = "<span style=\"word-wrap: break-word;\">"+msg+"</span>";
				}
			} else if(PP['login'] !== "") {
				var regex = new RegExp('\\b'+PP['login']+'\\b', 'i');
				if(regex.test(msg)) {
					msg = "<span id='bttvhighlight' style='color:white;font-weight:bold;word-wrap: break-word;'>"+msg+"</span>";
					setTimeout(function () {
						$$('#bttvhighlight').each(function(element) {
							$j(element).parent().parent().css({
														'background-color': 'rgba(255,0,0,0.5)',
														'padding': "3px"
													});
						});
	        		}, 1000);
				} else {
					msg = "<span style=\"word-wrap: break-word;\">"+msg+"</span>";
				}
			}

			return msg;
		}


		ich.templates["chat-line-action"] = "<li class='chat_from_{{sender}} line' data-sender='{{sender}}'><p><span class='small'>{{timestamp}}&nbsp;</span>{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}<span class='nick' style='color:{{color}};'>{{displayname}}</span><span class='chat_line' style='color:{{color}};'> @message</span></p></li>";
		//console.log(ich.templates);

		var tempBan = '<span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn" onclick="javascript:CurrentChat.ghetto24Hour(28800);" title="Temporary 8 hour ban"><span class="glyph_only"><img src="http://betterttv.nightdev.com/8hr.png" /></span></a></span><span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn" onclick="javascript:CurrentChat.ghetto24Hour(86400);" title="Temporary 24 hour ban"><span class="glyph_only"><img src="http://betterttv.nightdev.com/24hr.png" /></span></a></span>';
		$j(tempBan).insertAfter("#chat_menu_timeout");
		$j("#chat_menu_tools").insertAfter("#chat_menu_op_tools");

		CurrentChat.TMIFailedToJoin = true;
		CurrentChat.TMIFailedToJoinTries = 1;

		var checkJoinFail = {};

		CurrentChat.ghetto24Hour = function(time) {
			CurrentChat.say("/timeout "+$("user_info").current_login+" "+time);
		}

		CurrentChat.handlers.user_names_end = function() {
			clearTimeout(checkJoinFail);
			CurrentChat.TMIFailedToJoin = false;
			CurrentChat.retries = 10;
			CurrentChat.admin_message(i18n("Welcome to the "+PP['channel'].capitalize()+"'s chat room!"));
			$("chat_text_input").disabled = !1;
			CurrentChat.currently_scrolling = !0;
			CurrentChat.scroll_chat();
			CurrentChat.rooms();
		}

		CurrentChat.handlers.error = function() {
			CurrentChat.admin_message(i18n("BetterTTV: Chat encountered an error.."));
			CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
			CurrentChat.reconnect();
		}

		CurrentChat.handlers.debug = function(a) {
			CurrentChat.debug && CurrentChat.admin_message("DEBUG: " + a.message);
			if(a.message.match(/^Connecting to (.*):(80|443)$/)) {
				CurrentChat.currentServer = /^Connecting to (.*):(80|443)$/.exec(a.message)[1];
				console.log("Current chat server: "+CurrentChat.currentServer)
			}
			if(a.message.match(/^connected$/)) {
				CurrentChat.admin_message(i18n("Connected to the chat server."));
			}
			if(a.message.match(/^Connection lost/)) {
				if(CurrentChat.silence && CurrentChat.silence === true) {
					CurrentChat.silence = false;
					return;
				}
				if(CurrentChat.last_sender === PP['login']) {
					CurrentChat.admin_message(i18n("BetterTTV: You were disconnected from chat."));
					CurrentChat.admin_message(i18n("BetterTTV: It is very likely you are globally banned from chat for 8 hours."));
					CurrentChat.admin_message(i18n("BetterTTV: Reconnecting anyways.."));
				} else {
					CurrentChat.admin_message(i18n("BetterTTV: You were disconnected from chat."));
					CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
					$j.getJSON("http://23.29.121.109/api/report?type=chat&test1=true&server="+/^Connection lost to \((.*):(80|443)\)/.exec(a.message)[1]);
				}
			}
		}

		CurrentChat.rejoinChat = function() {

			if(!CurrentChat.currentServer) {
				var a = CurrentChat.ircSystem.cloneNode(!0);
				CurrentChat.ircSystem.parentNode.replaceChild(a, this.ircSystem);
				CurrentChat.ircSystem = a;
				CurrentChat.me.is_loaded = !1;
				CurrentChat.connect(CurrentChat.room)
				CurrentChat.silence = true;
				CurrentChat.admin_message(i18n("BetterTTV: Trying a different server"));
			}
			if(CurrentChat.TMIFailedToJoinTries <= 10) {
				CurrentChat.admin_message(i18n("BetterTTV: Attempting to join again.. ["+CurrentChat.TMIFailedToJoinTries+"/10]"));
				CurrentChat.ircSystem.join("#"+PP["channel"]);
				checkJoinFail = setTimeout(function(){
					if(CurrentChat.TMIFailedToJoin === true) {
						CurrentChat.admin_message(i18n("BetterTTV: Unable to join the chat room.."));
						CurrentChat.rejoinChat();
					}
				},10000);
				CurrentChat.TMIFailedToJoinTries++;
				$j.getJSON("http://23.29.121.109/api/report?type=chat&test2=true&server="+CurrentChat.currentServer);
			} else {
				CurrentChat.admin_message(i18n("BetterTTV: Looks like chat is broken.. I give up. :("));
			}
			
		}

		CurrentChat.handlers.connected = function() {
			checkJoinFail = setTimeout(function(){
				if(CurrentChat.TMIFailedToJoin === true) {
					CurrentChat.admin_message(i18n("BetterTTV: Unable to join the chat room.."));
					CurrentChat.rejoinChat();
				}
			},10000);
			CurrentChat.admin_message(i18n("Joining the chat room.."));
			CurrentChat.join_on_connect && CurrentChat.join(CurrentChat.join_on_connect);
	        CurrentChat.join_on_connect = null;
	        $("chat_line_list").innerHTML = "";
	        CurrentChat.line_count = 0;
	        $("chat_text_input").disabled = !1;
	        CurrentChat.debug && CurrentChat.ircSystem.debugOn();
		}

		CurrentChat.handlers.clear_chat = function(info) {
			console.log(info)
			var nickname = CurrentChat.real_username(info.user);
			if (info.target == "all") {
				CurrentChat.last_sender = "jtv";
				CurrentChat.insert_with_lock("#chat_line_list",'<li class="line fromjtv"><p class="content">Chat was cleared by a moderator (Prevented by BetterTTV)</p></li>');
			} else if (info.target == "user") {
				var nickname = CurrentChat.real_username(info.user);
				$$('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + ' .chat_line').each(function (message) {
					message.innerHTML = "<span style=\"color: #999\">" + message.innerHTML + "</span>";
				});
				CurrentChat.last_sender = "jtv";
				CurrentChat.insert_with_lock("#chat_line_list",'<li class="line fromjtv"><p class="content"><span style="text-transform:capitalize;">'+nickname+"</span> has been timed out."+"</p></li>");
			}
		}

		$j('#chat_text_input').live('keydown', function(e) { 
		  var keyCode = e.keyCode || e.which; 
		  if (keyCode == 9) { 
		    e.preventDefault(); 
		    var sentence = $j('#chat_text_input').val().split(' ');
		    var partialMatch = sentence.pop().toLowerCase();
		    var users = CurrentViewers;
			var userIndex = 0;
			if(window.partialMatch === undefined) {
			  window.partialMatch = partialMatch;
			} else if(partialMatch.search(window.partialMatch) !== 0){
			  window.partialMatch = partialMatch;
			} else {
			  if (sentence.length === 0) {
			    userIndex = users.indexOf(partialMatch.substr(0, partialMatch.length-1));
			  } else {
			    userIndex = users.indexOf(partialMatch);
			  }
			}
			for (var i=userIndex; i<users.length; i++) {
			  var user = users[i] || '';
			  if (window.partialMatch.length > 0 && user.search(window.partialMatch, "i") === 0) {
			    if(user === partialMatch || user === partialMatch.substr(0, partialMatch.length-1)){
			      continue;
			    }
			    sentence.push(user.capitalize());
			    if (sentence.length === 1) {
			      $j('#chat_text_input').val(sentence.join(' ') +  ":");
			    } else {
			      $j('#chat_text_input').val(sentence.join(' '));
			    }
			    break;
			  }
			}
		  } 
		});

		setTimeout(function(){updateViewerList()},5000);
		setInterval(function(){updateViewerList()},300000);
	}	

	checkFollowing = function() {

		betterttvDebug.log("Checking Following List");

		//Beta Channel Tracking
		$j(window).on("firebase:follow_online", function (b, f) {
			if(f.online === true) {
				console.log(f.name+" is online.. Running Growl")
				Twitch.api.get("channels/"+f.name.toLowerCase()).done(function (d) {
					if(d.name) {
						console.log(d)
						$j.gritter.add({
					        title: d.display_name+' is Now Streaming',
					        image: d.logo,
					        text: d.display_name+' just started streaming '+d.game+'.<br /><br /><a style="color:white" href="http://www.twitch.tv/'+d.name+'">Click here to head to '+d.display_name+'\'s channel</a>.',
					    });
					}
				});
			}
		});

		/*
		if(typeof(liveChannels) !== 'undefined' && liveChannels.length !== 0) {
			//console.log(liveChannels);
			oldLiveChannels = liveChannels;
			liveChannels = [];
		} 

		Twitch.api.get("streams/followed?limit=100&offset=0").done(function (d) {
			if(d.streams) {
				$j.each(d.streams,function(index, channel) {
					liveChannels.push(channel.channel.name);
					//console.log(liveChannels);
					if(typeof(oldLiveChannels) !== 'undefined') {
						if(oldLiveChannels.indexOf(channel.channel.name) === -1) {
							$j.gritter.add({
						        title: channel.channel.display_name+' is Now Streaming',
						        image: channel.channel.logo,
						        text: channel.channel.display_name+' just started streaming '+channel.channel.game+'.<br /><br /><a style="color:white" href="http://www.twitch.tv/'+channel.channel.name+'">Click here to head to '+channel.channel.display_name+'\'s channel</a>.',
						    });
						}
					}
				});
			}
			setTimeout(function(){checkFollowing()},120000);
		});
*/

	}

	overrideEmotes = function() {

		betterttvDebug.log("Overriding Twitch Emoticons");

		if(!document.getElementById("chat_lines")) return;

		var betterttvEmotes = [
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/trollface.png", width: 23, height: 19, regex: "(\\:trollface\\:|\\:tf\\:)" },
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/aww.png", width: 18, height: 18, regex: "D\\:" },
								{ url: "http://betterttv.nightdev.com/emotes/mw.png", width: 20, height: 20, regex: "(\\:D|\\:d)" },
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/cry.png", width: 19, height: 19, regex: "\\:'\\(" },
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/puke.png", width: 19, height: 19, regex: "\\(puke\\)" },
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/mooning.png", width: 19, height: 19, regex: "\\(mooning\\)" },
								{ url: "http://s3.amazonaws.com/betterjtv/smileys/poolparty.png", width: 19, height: 19, regex: "\\(poolparty\\)" },
								{ url: "http://betterttv.nightdev.com/emotes/kona.png", width: 25, height: 34, regex: "KKona" },
								{ url: "http://betterttv.nightdev.com/emotes/foreveralone.png", width: 29, height: 30, regex: "ForeverAlone" },
								{ url: "http://betterttv.nightdev.com/emotes/chez.png", width: 32, height: 35, regex: "TwaT" },
								{ url: "http://betterttv.nightdev.com/emotes/black.png", width: 26, height: 30, regex: "RebeccaBlack" },
								{ url: "http://betterttv.nightdev.com/emotes/rage.png", width: 33, height: 30, regex: "RageFace" },
								{ url: "http://betterttv.nightdev.com/emotes/striker.png", width: 44, height: 35, regex: "rStrike" },
								{ url: "http://betterttv.nightdev.com/emotes/chaccept.png", width: 23, height: 34, regex: "CHAccepted" },
								{ url: "http://betterttv.nightdev.com/emotes/fuckyea.png", width: 45, height: 34, regex: "FuckYea" },
								{ url: "http://betterttv.nightdev.com/emotes/namja.png", width: 37, height: 40, regex: "ManlyScreams" },
								{ url: "http://betterttv.nightdev.com/emotes/pancakemix.png", width: 22, height: 30, regex: "PancakeMix" },
								{ url: "http://betterttv.nightdev.com/emotes/pedobear.png", width: 32, height: 30, regex: "PedoBear" },
								{ url: "http://betterttv.nightdev.com/emotes/genie.png", width: 25, height: 35, regex: "WatChuSay" },
								{ url: "http://betterttv.nightdev.com/emotes/pedonam.png", width: 37, height: 40, regex: "PedoNam" },
								{ url: "http://betterttv.nightdev.com/emotes/nam.png", width: 38, height: 40, regex: "NaM" },
								{ url: "http://betterttv.nightdev.com/emotes/luda.png", width: 36, height: 34, regex: "LLuda" },
								{ url: "http://betterttv.nightdev.com/emotes/updog.png", width: 32, height: 32, regex: "iDog" },
								{ url: "http://betterttv.nightdev.com/emotes/blackhawk.png", width: 33, height: 34, regex: "iAMbh" },
								{ url: "http://betterttv.nightdev.com/emotes/sdaw.png", width: 24, height: 34, regex: "ShoopDaWhoop" },
								{ url: "http://betterttv.nightdev.com/emotes/hydro.png", width: 22, height: 34, regex: "HHydro" },
								{ url: "http://betterttv.nightdev.com/emotes/chanz.png", width: 37, height: 40, regex: "OhGodchanZ" },
								{ url: "http://betterttv.nightdev.com/emotes/ohgod.png", width: 31, height: 34, regex: "OhGod" },
								{ url: "http://betterttv.nightdev.com/emotes/fapmeme.png", width: 35, height: 35, regex: "FapFapFap" },
								{ url: "http://betterttv.nightdev.com/emotes/socal.png", width: 100, height: 40, regex: "iamsocal" },
								{ url: "http://betterttv.nightdev.com/emotes/herbert.png", width: 29, height: 34, regex: "HerbPerve" },
								{ url: "http://betterttv.nightdev.com/emotes/panda.png", width: 36, height: 40, regex: "SexPanda" },
								{ url: "http://betterttv.nightdev.com/emotes/mandm.png", width: 54, height: 45, regex: "M&Mjc" },
								{ url: "http://betterttv.nightdev.com/emotes/jokko.png", width: 23, height: 35, regex: "SwedSwag" },
								{ url: "http://betterttv.nightdev.com/emotes/adz.png", width: 21, height: 34, regex: "adZ" },
								{ url: "http://betterttv.nightdev.com/emotes/pokerface.png", width: 23, height: 35, regex: "PokerFace" },
								{ url: "http://betterttv.nightdev.com/emotes/jamontoast.png", width: 33, height: 30, regex: "ToasTy" },
								{ url: "http://betterttv.nightdev.com/emotes/basedgod.png", width: 33, height: 34, regex: "BasedGod" },
								{ url: "http://betterttv.nightdev.com/emotes/fishmoley.png", width: 56, height: 34, regex: "FishMoley" },
								{ url: "http://betterttv.nightdev.com/emotes/angry.png", width: 56, height: 34, regex: "cabbag3" },
								{ url: "http://cdn.nightdev.com/img/snhappthis.gif", width: "50px;background-size:50px 50", height: 50, regex: "S0urPlz" }
							  ];

		var oldEmotes = [
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ebf60cd72f7aa600-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d570c4b3b8d8fc4d-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae4e17f5b9624e2f-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-b9cbb6884788aa62-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-2cde79cfe74c6169-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-577ade91d46d7edc-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-374120835234cb29-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-cfaf6eac72fe4de6-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e838e5e34d9f240c-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3407bf911ad2fd4a-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-0536d670860bf733-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8e128fa8dc1de29c-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d31223e81104544a-24x18.png",
							"http://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9f2ac5d4b53913d7-24x18.png"
						];
		var newEmotes = [
							"http://www-cdn.jtvnw.net/images/emoticons/happy.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/sad.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/surprised.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/bored.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/cool.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/horny.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/skeptical.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/wink.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/raspberry.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/winkberry.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/pirate.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/drunk.gif",
							"http://www-cdn.jtvnw.net/images/emoticons/angry.gif",
							"http://betterttv.nightdev.com/emotes/mw.png"
						];

		CurrentChat.emoticons = [];

		Twitch.api.get("chat/emoticons?on_site=1").done(function (a) {
			var d = 0;
            cssString = "";
            a.emoticons.forEach(function (a) {
                a.regex = RegExp(a.regex, "g");
                a.images.forEach(function (a) {
                    d += 1;
                    if(oldEmotes.indexOf(a.url) !== -1 && localStorage.getItem("defaultemotes") !== "true") {
                    	a.url = newEmotes[oldEmotes.indexOf(a.url)];
                    	a.height = 22;
                    	a.width = 22;
                    }
                    a.html = ich["chat-emoticon"]({
                        id: d
                    }).prop("outerHTML");
                    cssString += CurrentChat.generate_emoticon_css(a, d);
                });
                CurrentChat.emoticons.push(a);
            });
            betterttvEmotes.forEach(function (b) {
            	var a = {};
            	a.regex = RegExp(b.regex, "g");
            	a.images = [];
            	a.images.push({emoticon_set:null,width:b.width,height:b.height,url:b.url});
            	a.images.forEach(function (a) {
                    d += 1;
                    a.html = ich["chat-emoticon"]({
                        id: d
                    }).prop("outerHTML");
                    cssString += CurrentChat.generate_emoticon_css(a, d);
                });
            	CurrentChat.emoticons.push(a);
            });
            cssString += ".emoticon { display: inline-block; }";
            var emoteCSS = document.createElement("style");
			emoteCSS.setAttribute("type","text/css");
			emoteCSS.innerHTML = cssString;
			$j('body').append(emoteCSS);
		});

	}

	updateViewerList = function() {

		betterttvDebug.log("Updating Viewer List");
		
        $j.ajax({
            url: "https://tmi.twitch.tv/group/user/" + PP['channel']+ "/chatters?update_num=" + Chatters.updateNum + "&callback=?",
            cache: !1,
            dataType: "jsonp",
            timeoutLength: 6E3
        }).done(function (d) {
        	if(d.data.chatters) {
        		Chatters.updateNum++;
            	CurrentViewers = [];
				["staff", "admins", "moderators", "viewers"].forEach(function (a) {
	                d.data.chatters[a].forEach(function (a) {
	                    CurrentViewers.push(a);
	                });
	            });
        	}
        });

	}

	darkenPage = function() {

		betterttvDebug.log("Darkening Chat");

		if(PP['page_type'] === "video" || PP['page_type'] === "channel") {
			if(localStorage.getItem("darkchat") === "true") {
				var darkCSS = document.createElement("link");
				darkCSS.setAttribute("href","http://betterttv.nightdev.com/betterttv-dark.css");
				darkCSS.setAttribute("type","text/css");
				darkCSS.setAttribute("rel","stylesheet");
				darkCSS.setAttribute("id","darkTwitch");
				darkCSS.innerHTML = '';
				$j('body').append(darkCSS);

				function checkChannelViewerCount() {
					console.log("Checking for Viewer Count");
					if($j("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").length && $j("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").is(':empty')) {
						$j("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display","none");
						console.log("1");
					} else {
						console.log("2");
						$j("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display","inline-block");
					}
					setTimeout(checkChannelViewerCount, 5000);
				}

				checkChannelViewerCount();

			}
		}

	}

	createSettingsMenu = function() {

		betterttvDebug.log("Creating BetterTTV Settings Menu");

		var settingsMenu = document.getElementById("chat_settings_dropmenu");
		if(!settingsMenu) return;

		bttvSettings = document.createElement("div");
		bttvSettings.setAttribute("align","left");
		bttvSettings.setAttribute("id","bttvsettings");
		bttvSettings.style.margin = "0px auto";

		if(localStorage.getItem("narrowchat") == "yes") { narrowChat = "false"; } else { narrowChat = "true"; }
		if(localStorage.getItem("defaultemotes") !== "true") { defaultEmotes = "false"; } else { defaultEmotes = "true"; }
		if(localStorage.getItem("defaulttags") !== "true") { defaultTags = "false"; } else { defaultTags = "true"; }
		if(localStorage.getItem("blocksub") == "true") { blockSubscriber = "false"; } else { blockSubscriber = "true"; }
		if(localStorage.getItem("featured") !== "true") { blockFeatured = "false"; } else { blockFeatured = "true"; }
		if(localStorage.getItem("hidemeebo") !== "true") { hideMeebo = "false"; } else { hideMeebo = "true"; }
		if(localStorage.getItem("darkchat") == "true") { darken = "Undarken Chat"; } else { darken = "Darken Chat"; }
		
		bttvSettings.innerHTML = '<ul class="dropmenu_col inline_all"> \
							<li id="chat_section_chatroom" class="dropmenu_section"> \
							<br /> \
							&nbsp;&nbsp;&nbsp;&raquo;&nbsp;BetterTTV \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="darkchatlink" onclick="betterttvAction(\'toggledark\'); return false;">' + darken + '</a> \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="betterttvAction(\'highlightkeywords\'); return false;">Set Highlight Keywords</a> \
							<a class="dropmenu_action g18_trash-FFFFFF80" href="#" onclick="betterttvAction(\'clear\'); return false;">Clear My Chat</a> \
							<p onclick="betterttvAction(\'defaultemotes\');document.getElementById(\'defaultemotes\').checked=' + defaultEmotes + ';" class="dropmenu_action"> \
							<input type="checkbox" id="defaultemotes" class="left"> Default Emoticons</p> \
							<p onclick="betterttvAction(\'defaulttags\');document.getElementById(\'defaulttags\').checked=' + defaultTags + ';" class="dropmenu_action"> \
							<input type="checkbox" id="defaulttags" class="left"> Default Chat Tags</p> \
							<p onclick="betterttvAction(\'narrowchat\');document.getElementById(\'narrowchat\').checked=' + narrowChat + ';" class="dropmenu_action"> \
							<input type="checkbox" id="narrowchat" class="left"> Narrow Chat</p> \
							<p onclick="betterttvAction(\'blocksub\');document.getElementById(\'blocksub\').checked=' + blockSubscriber + ';" class="dropmenu_action"> \
							<input type="checkbox" id="blocksub" class="left"> Hide Subscribe Button</p> \
							<p onclick="betterttvAction(\'togglemeebo\');document.getElementById(\'hidemeebo\').checked=' + hideMeebo + ';" class="dropmenu_action"> \
							<input type="checkbox" id="hidemeebo" class="left"> Hide Meebo</p> \
							<p onclick="betterttvAction(\'featured\');document.getElementById(\'featured\').checked=' + blockFeatured + ';" class="dropmenu_action"> \
							<input type="checkbox" id="featured" class="left"> Show Featured Channels</p> \
							</li> \
							</ul> \
							';

		settingsMenu.appendChild(bttvSettings);

		$$('.dropmenu_action').each(function(element) {
			element.style.color = "#ffffff";
		});

		if(localStorage.getItem("narrowchat") == "yes") document.getElementById("narrowchat").checked = true;
		if(localStorage.getItem("defaultemotes") == "true") document.getElementById("defaultemotes").checked = true;
		if(localStorage.getItem("defaulttags") == "true") document.getElementById("defaulttags").checked = true;
		if(localStorage.getItem("blocksub") == "true") document.getElementById("blocksub").checked = true;
		if(localStorage.getItem("featured") == "true") document.getElementById("featured").checked = true;
		if(localStorage.getItem("hidemeebo") == "true") document.getElementById("hidemeebo").checked = true;
	}

	betterttvAction = function(action) {
		if(action == "clear") {
			$j('#chat_line_list').html("");
			CurrentChat.admin_message("You cleared your own chat (BetterTTV)");
		}
		if(action == "highlightkeywords") {
			var keywords = prompt("Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords.",localStorage.getItem("highlightkeywords"));
			if (keywords != null) {
				localStorage.setItem("highlightkeywords", keywords);
				var keywords = keywords.split(" ");
				var keywordlist = PP['login'];
				keywords.forEach(function(keyword){ keywordlist = keywordlist + ", " + keyword; });
				CurrentChat.admin_message("Highlight Keywords are now set to: "+keywordlist);
			}
		}
		if(action == "narrowchat") {
			if(localStorage.getItem("narrowchat") == "yes") {
				localStorage.setItem("narrowchat", "no");
			} else {
				localStorage.setItem("narrowchat", "yes");
			}
			window.location.reload();
		}
		if(action == "defaultemotes") {
			if(localStorage.getItem("defaultemotes") == "true") {
				localStorage.setItem("defaultemotes", "false");
			} else {
				localStorage.setItem("defaultemotes", "true");
			}
			window.location.reload();
		}
		if(action == "defaulttags") {
			if(localStorage.getItem("defaulttags") == "true") {
				localStorage.setItem("defaulttags", "false");
			} else {
				localStorage.setItem("defaulttags", "true");
			}
			window.location.reload();
		}
		if(action == "togglemeebo") {
			if(localStorage.getItem("hidemeebo") == "true") {
				localStorage.setItem("hidemeebo", "false");
			} else {
				localStorage.setItem("hidemeebo", "true");
			}
			window.location.reload();
		}
		if(action == "toggledark") {
			if(localStorage.getItem("darkchat") == "true") {
				localStorage.setItem("darkchat", "false");
				window.location.reload();
			} else {
				localStorage.setItem("darkchat", "true");
				darkenPage();
				document.getElementById("darkchatlink").innerHTML="Undarken Chat";
			}
		}
		if(action == "blocksub") {
			var getsub = document.getElementById("sub-details");
			if(localStorage.getItem("blocksub") == "true") {
				localStorage.setItem("blocksub", "false");
				if(getsub) { getsub.style.display='inline'; }
			} else {
				localStorage.setItem("blocksub", "true");
				if(getsub) { getsub.style.display='none'; }
			}
		}
		if(action == "featured") {
			if(localStorage.getItem("featured") == "true") {
				localStorage.setItem("featured", "false");
			} else {
				localStorage.setItem("featured", "true");
			}
			window.location.reload();
		}
	}

	try {
		if(BTTVLOADED==true) return;
	} catch(err) {
		betterttvDebug.log("BTTV LOADED");
		BTTVLOADED=true;
	}

	if(document.URL.indexOf("meebo.html") != -1)
	{
		return;
	}
	if(typeof($) === 'undefined') 
	{
		return;
	}
	if(typeof(Array.prototype.each) === 'undefined')
	{
		return;
	}


	
	if(PP['channel'] === "namja") {
		var trollNamja = document.createElement("img");
			trollNamja.setAttribute("src","http://i.imgur.com/7TRYhEc.jpg");
			trollNamja.setAttribute("style","width:100%;height:100%;float:left;position:absolute;top:0px;left:0px;display:none;z-index:9001;");
			trollNamja.setAttribute("id","namjatroll");
			$j("body").append(trollNamja);

		setTimeout(function(){$j("#namjatroll").fadeIn('slow')}, 2000);
		setTimeout(function(){$j("#namjatroll").fadeOut('slow')}, 7000);
	}

	betterttvDebug.log("BTTV v"+betterttvVersion);
	betterttvDebug.log("CALL init "+document.URL);
	brand();
	clearAds();
	directoryReformat();
	channelReformat();
	chatReformat();
	newChannelReformat();
	checkMessages();
	clearAds();
	checkFollowing();
	darkenPage();
	setTimeout(clearAds, 1000);
	setTimeout(clearAds, 5000);
	setTimeout(chatFunctions, 1000);
	setTimeout(createSettingsMenu, 1000);
	setTimeout(overrideEmotes, 10000);
	setTimeout(meeboReformat, 5000);

	(function(b){b.gritter={};b.gritter.options={position:"top-left",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(!g.text){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})(jQuery);

	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-39733925-4', 'betterttv.net');
	ga('send', 'pageview');

}();