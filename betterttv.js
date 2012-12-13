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

	var betterttvVersion = "5.8",
		betterttvDebug = {
			log: function(string) { if(window.console && console.log) console.log("BTTV: "+string); },
			warn: function(string) { if(window.console && console.warn) console.warn("BTTV: "+string); },
			error: function(string) { if(window.console && console.error) console.error("BTTV: "+string); },
			info: function(string) { if(window.console && console.info) console.info("BTTV: "+string); }
		},
		currentViewers = [],
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

		var clearList = [
			".a300",
			".advertisement",
			".fp_ad",
			".hide_ad",
			"#ad",
			"#fb_like_button",
			"#fb_like_box",
			"#google_ads_div_Twitch_ChanMedRectv2_ad_container",
			"#google_ads_div_Twitch_ClipsMedRectv2_ad_container",
			"#google_ads_div_Twitch_DirectoryMedRectv2_ad_container",
			"#header_notification",
			"#Twitch_FPopaBanner",
			"#Twitch_FPMedRect",
			"#Twitch_DiropaBanner",
			"#Twitch_DirLeaderv2_holder"
			],
			frontPageAd = document.getElementById("Twitch_FPopaBanner"),
			directoryPageAd = document.getElementById("Twitch_DiropaBanner");

		if(frontPageAd || directoryPageAd) {
			$j("body").css("background","url(\"../images/xarth/bg_noise.png\") repeat scroll 0% 0% rgb(38, 38, 38)");
			$j("#mantle_skin").css("background","none");
			window.addEventListener("click", null, false);
			window.removeEventListener("click", null, false);
			window.addEventListener("mouseover", null, false);
			window.removeEventListener("mouseover", null, false);
		}

		if(localStorage.getItem("related") !== "true") removeElement('.sm_vids');
		if(localStorage.getItem("blocksub") == "true") $j("#sub-details").css("display","none");
		clearList.forEach(removeElement);

	}

	channelReformat = function() {

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
		if(!document.getElementById("vod_form") && document.getElementById("channel_viewer_count") && PP['page_type'] !== "new_channel") {
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

		var directory = document.getElementById("directory_channels");

		if(!directory) return;

		$$(".c4").each(function(e) {
			e.style.width = '250px';
		});
		$j("#directory_channels").css("width","690px");
		$j("#gameselector_input").css("width","230px");

		var directoryCSS = document.createElement("style");
		directoryCSS.setAttribute("type","text/css");
		directoryCSS.innerHTML = ".games-grid .game .boxart { width: 136px !important; height: 190px !important; } .stream {width:150px !important;height:150px !important;} .streams .stream .thumb img.cap, .by_game .stream .thumb img.cap {width:150px !important;height:84.375px !important;} .boxart {margin-top:10px !important;height:50px !important;} .meta {height:75px !important;padding-bottom:2px;} .video_grid .video .channelname, .streams .stream .channelname {white-space:normal !important;margin-top:-2px !important;height:35px !important;}";
		$j('body').append(directoryCSS);

	}

	chatReformat = function() {

		betterttvDebug.log("Reformatting Chat");

		if(document.getElementById("new_channel")) return;

		var chat = document.getElementById("chat_lines"),
			channelHeader = document.getElementById("header_banner");

		if(!chat) return;

		if(channelHeader) {
			channelHeader = 125;
		} else {
			channelHeader = 0;
		}

		$j("#chat_line_list").css({
			fontSize: "13.33333px",
			lineHeight: "17.333333px",
			width: "100%"
		});
		$j("#chat_lines").css({
			fontFamily: "Helvetica, Arial, sans-serif",
			height: channelHeader+450 + "px",
			maxHeight: channelHeader+450 + "px",
			overflowX: "hidden",
			overflowY: "auto",
			width: "100%"
		});

		if(localStorage.getItem("narrowchat") !== "yes") {
			$j(".chat_box").css("width","97%");
		} else {
			$j(".chat_box").css("width","95%");
		}

		$j('#chat_loading_spinner').attr('src',"data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");
	
		var chatCSS = document.createElement("style");
		chatCSS.setAttribute("type","text/css");
		chatCSS.innerHTML = ".dropmenu a, .ui-menu a, .ui-multiselect-menu a { color: white !important; } input.text:focus,select:focus,textarea:focus{outline:0;background-color:#fff;box-shadow:0 0 3px 1px #dad9d9;-moz-box-shadow:0 0 3px 1px #dad9d9;-webkit-box-shadow:0 0 3px 1px #dad9d9;border:1px solid #000;color:#000;} .primary_button:hover,.primary_button:focus{ background: linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -o-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -moz-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -webkit-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -ms-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%); } .primary_button { border-color: #000 !important; background: linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -o-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -moz-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -webkit-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -ms-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%); } .chat_line a {color:#005596;} #chat_line_list li .mod_button img{vertical-align:baseline;padding: 0px;margin-bottom:-5px;} .chat_line img {vertical-align: baseline !important;} .line .mod, .line .staff, .line .admin, .line .broadcaster {background-image: none !important;background-position: none !important;background-repeat: none !important;display: inline !important;height: none !important;min-width: none !important;overflow: none !important;padding: 1px 3px !important;text-indent: none !important;vertical-align: baseline !important;color: white !important;font-size: 0.8572em !important;font-weight: bold !important;} .line .bot {background-color: #666666;border-radius: 2px 2px 2px 2px;padding: 1px 3px;font-weight: bold;font-size: 0.8572em;color: white;display:inline !important;} .line .brown {background-color: #6B4226;border-radius: 2px 2px 2px 2px;padding: 1px 3px;font-weight: bold;font-size: 0.8572em;color: white;display:inline !important;} .line .orange {background-color: orange;border-radius: 2px 2px 2px 2px;padding: 1px 3px;font-weight: bold;font-size: 0.8572em;color: white;display:inline !important;} .line .lefty {background-color: red;background-image:url('http://betterttv.nightdev.com/ca.gif');padding-left:23px !important;border-radius: 2px 2px 2px 2px;padding: 1px 3px;font-weight: bold;font-size: 0.8572em;color: white;display:inline !important;} .line .staff {background-color: #06C;} .line .purple {background-color: #4F007B;border-radius: 2px 2px 2px 2px;padding: 1px 3px;font-weight: bold;font-size: 0.8572em;color: white;display:inline !important;}";
		$j('body').append(chatCSS);

	}

	newChannelReformat = function() {

		betterttvDebug.log("Reformatting Beta Channel Page");

		if(!document.getElementById("new_channel")) return;

		$j('.featured').remove();
		$j.get('http://www.twitch.tv/inbox', function(data) {
			PP['notifications'] = (data.split("unread").length - 2)
			if(PP['notifications'] == 10) PP['notifications'] = "10+"
			if(PP['notifications'] !== 0) {
				var messagesnum = document.createElement("a"),
					user_display_name = document.getElementById("user_display_name");
				messagesnum.setAttribute("id","messagescont");
				messagesnum.setAttribute("href","/inbox");
				messagesnum.setAttribute("style","margin-left: 10px;");
				messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(http://www-cdn.jtvnw.net/images/xarth/g/g18_mail-FFFFFF80.png);background-position: 8px -2px;background-repeat: no-repeat;color:white;'>" + PP['notifications'] + "</span>";
				user_display_name.appendChild(messagesnum);
			}
			setTimeout(function(){checkMessages(true)}, 300000);
		});

		var logo = document.getElementById("logo"),
			watermark = document.createElement("div");

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
		logo.appendChild(watermark);

		if(localStorage.getItem("hidemeebo") !== "true") {
			$j("#right_col").css("bottom","35px");
			$j("#left_col").css("bottom","35px");
		}

		document.getElementById("right_close").setAttribute('title','Drag to Resize Chat or Click to Open/Close');
		document.getElementById("left_close").setAttribute('title','Click to Open/Close');
		$j(".scroll-content-contain").css("bottom","35px");
		$j("#small_nav .content ul #small_home a").css("background","url(http://betterttv.nightdev.com/newnavicons.png) no-repeat 0 0");
		removeElement(".related");
		meebo();

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
				if(chat_width == 0) {
					$j("#right_col .content #chat").width(319);
					$j("#right_col .content .top").width(319);
				} else {
					$j("#right_col .content #chat").width(chat_width);
					$j("#right_col .content .top").width(chat_width);
				}

				var d = 0;
				$j(".fixed").each(function () {
	                d += $j(this).outerWidth()
	            });
	            $j("#player_col").css({
	                width: $j(window).width() - d + "px"
	            });

	            var h = 0.5625 * $j("#player_col").width() - 4;
	            if(h > $j(window).height() - $j("#player_col .top").outerHeight() - 40) {
	            	($j(".live_site_player_container").css({ height: $j(window).height() - $j("#player_col .top").outerHeight() - 40 + "px" }), $j("#player_col .scroll-content-contain").animate({ scrollTop: 90 }, 150, "swing"));
	            } else {
	            	$j(".live_site_player_container").css({ height: h.toFixed(0) + "px" });
	            } 

	            $j(".scroll").customScroll("recalculate");
	            
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
	            $j("#player_col").css({
	                width: $j(window).width() - d + "px"
	            });

	            var h = 0.5625 * $j("#player_col").width() - 4;
	            if(h > $j(window).height() - $j("#player_col .top").outerHeight() - 40) {
	            	($j(".live_site_player_container").css({ height: $j(window).height() - $j("#player_col .top").outerHeight() - 40 + "px" }), $j("#player_col .scroll-content-contain").animate({ scrollTop: 90 }, 150, "swing"));
	            } else {
	            	$j(".live_site_player_container").css({ height: h.toFixed(0) + "px" });
	            } 

	            $j(".scroll").customScroll("recalculate");
	            
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
		});

	}

	blockVideoAds = function() {

		betterttvDebug.log("Blocking Video Ads");

		if(typeof PP != "undefined") {
			if (localStorage.getItem("blockads") !== undefined) {
				if(localStorage.getItem("blockads") == "true") {
					PP['is_pro'] = localStorage.getItem("blockads");
					PP.pro_account_activated = localStorage.getItem("blockads");
				}
			} else {
				PP['is_pro'] = "false";
			}
		}

	}

	brand = function() {

		betterttvDebug.log("Branding Twitch with BTTV logo");

		var logo = document.getElementById("header_logo");

		if(!logo) return;

		logo.innerHTML="<img alt=\"TwitchTV\" src=\"http://betterttv.nightdev.com/newtwitchlogo.png\"><!--div style='left:5px;top:5px;float:left;position:absolute;'><b><a style='color:black !important;' href='http://www.twitch.tv/nightwalker925'>Come support Night, the BetterTTV dev!</a></b></div-->";
		watermark = document.createElement("div");
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
		logo.appendChild(watermark);

		proauth = document.getElementById("pro_authenticated");
		var globalCSSInject = document.createElement("style");
		globalCSSInject.setAttribute("type","text/css");
		globalCSSInject.innerHTML = '.chat_line a {color:#005596;} h2 { font-size: 16px; } #team_member_list .page_links a { color: #374a9b !important; } #team_member_list .page_links a b.left { border-left-color: #374a9b !important; } #team_member_list .page_links a b.right { border-left-color: #374a9b !important; } .member.live { background: #bdbcbc; } .member a { color: black; } .member.playing { background-color: #374a9b; border-color: #000000; } input.text:focus,select:focus,textarea:focus{outline:0;background-color:#fff;box-shadow:0 0 3px 1px #dad9d9;-moz-box-shadow:0 0 3px 1px #dad9d9;-webkit-box-shadow:0 0 3px 1px #dad9d9;border:1px solid #000;color:#000;} .primary_button:hover,.primary_button:focus{ background: linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -o-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -moz-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -webkit-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -ms-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%); } .primary_button { border-color: #000 !important; background: linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -o-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -moz-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -webkit-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -ms-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%); } #metagame a {color:white !important;} #team_membership a {color:white !important;} ul.tabs li.tab a {color:#262626;} ul.tabs li.selected a { color:#262626; } #header_banner img { width: 640px !important; height: 125px !important; } .dropmenu a, .ui-menu a, .ui-multiselect-menu a { color: white !important; } #menu_defaults .game_filter.selected a, #menu_filtered .game_filter.selected a, #menu_featured .game_filter.selected a { border: #000; background-color: #374a9b; } body {letter-spacing:0px;} a {color: black;} #growl_container {left: 0; overflow: hidden; padding-top: 0.7143em; position: fixed; top: 60px; z-index: 999999;} .notification_holder {padding: 0 0.7143em 0.7143em;} .notification {background-color: rgba(34, 34, 34, 0.85); border: 3px solid transparent; border-radius: 10px 10px 10px 10px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); color: #FFFFFF; cursor: pointer; min-height: 4.28em; padding: 0.7143em; position: relative; width: 14.29em;}.notification .close { background: none repeat scroll 0 0 #000000; border-radius: 0.75em 0.75em 0.75em 0.75em; color: #FFFFFF; display: none; height: 1.4em; padding: 0 6px; position: absolute; right: 0.3575em; top: 0.3575em;} .notification:hover {border: 3px solid #FFFFFF;} .notification a {color: #3399FF;}';
		$j("body").append(globalCSSInject);

		$j.get('http://www.twitch.tv/inbox', function(data) {
			PP['notifications'] = (data.split("unread").length - 2)
			if(PP['notifications'] == 10) PP['notifications'] = "10+"
			if(PP['notifications'] !== 0) {
				messagesnum = document.createElement("a");
				header_following = document.getElementById("header_following");
				messagesnum.setAttribute("id","messagescont");
				messagesnum.setAttribute("href","/inbox");
				messagesnum.setAttribute("class","normal_button");
				messagesnum.setAttribute("style","margin-right: 10px;");
				messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(http://betterttv.nightdev.com/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + PP['notifications'] + "</span>";
				header_following.parentNode.insertBefore(messagesnum, header_following);
			}
			setTimeout(function(){checkMessages(false)}, 300000);
		});

		$$('.channelname').each(function(element) {
			element.style.whiteSpace = 'normal';
			element.style.height = '32px';
		});

		meebo();

	}

	checkMessages = function(videopage) {

		betterttvDebug.log("Checking for New Messages");

		if(videopage === true) {
			$j.get('http://www.twitch.tv/inbox', function(data) {
				PP['notifications'] = (data.split("unread").length - 2)
				if(PP['notifications'] == 10) PP['notifications'] = "10+"
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
				PP['notifications'] = (data.split("unread").length - 2)
				if(PP['notifications'] == 10) PP['notifications'] = "10+"
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
		
	}

	meeboReformat = function() {
		
		betterttvDebug.log("Reformatting the Meebo Bar");

		$j('#meebo-googlePlus-plusone-0').remove();
		$j('.meebo-20').remove();
		$j('.meebo-29').remove();
		$j('.meebo-22').replaceWith('<a href="http://bugs.nightdev.com/betterttv/issues/new" style="margin-right:8px;margin-bottom:3px;color:black;" class="normal_button"><span>Report a BetterTTV Bug</span></a><a href="http://www.betterttv.com" style="margin-right:7px;margin-bottom:3px;color:black;" class="normal_button"><span>BetterTTV v'+betterttvVersion+'</span></a>');

	}

	meebo = function() {

		betterttvDebug.log("Handling the Meebo Bar");

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

		if(!CurrentChat.show_timestamps && CurrentChat.toggle_show_timestamps) {
			if(typeof toggle_checkbox != "undefined") {
				toggle_checkbox("toggle_chat_timestamps");
			}
			CurrentChat.toggle_show_timestamps();
		}

		Chat.prototype.insert_chat_lineOld=Chat.prototype.insert_chat_line;
		Chat.prototype.insert_chat_line=function(info)
		{
			if(info.color == "blue" && localStorage.getItem("darkchat") === "true") { info.color = "#3753ff"; }
			if(info.tagtype == "broadcaster") { info.tagname = "Host"; }
			var x=0;
			if(info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin") x=1;
			if(info.nickname == "night" && x==1) { info.tagtype="orange"; info.tagname = "Creator"; }
			//Bots
			if(info.nickname == "moobot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "nightbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "nokzbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
			if(info.nickname == "sourbot" && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }
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
			if(info.nickname == "boogie_yellow" && x==1) { info.tagtype="orange"; info.tagname = "Yellow"; }
			if(info.nickname == "lltherocksaysll" && x==1) { info.tagtype="broadcaster"; info.tagname = "Topswell"; }
			if(info.nickname == "melissa_loves_everyone" && x==1) { info.tagtype="purple"; info.tagname = "Chubby"; info.nickname="Bunny"; }
			if(info.nickname == "redvaloroso" && x==1) { info.tagtype="broadcaster"; info.tagname = "Dio"; }
			if(info.nickname == "slapage" && x==1) { info.tagtype="bot"; info.tagname = "I aM"; }
			if(info.nickname == "aclaz_92" && x==1) { info.tagtype="bot"; info.tagname = "412"; }
			if(info.nickname == "deano2518" && x==1) { info.tagtype="orange"; info.tagname = "<span style='color:black;'>WWFC</span>"; }
			if(info.nickname == "eternal_nightmare" && x==1) { info.tagtype="broadcaster"; info.tagname = "Emo"; info.nickname = "Nickiforek"; }
			if(info.nickname == "iivii_beauty" && x==1) { info.tagtype="purple"; info.tagname = "Crave"; }
			if(info.nickname == "sournothardcore" && x==1) { info.timestamp = info.timestamp+"</span><span class=\"tag brown\" style=\"margin-left:2px;color:#FFE600 !important;\" original-title=\"Saucy\">Saucy</span><span>"; }
			//People
			if(info.nickname == "mac027" && x==1) { info.tagtype="admin"; info.tagname = "Hacks"; }
			if(info.nickname == "socaldesigner" && x==1) { info.tagtype="broadcaster"; info.tagname = "Legend"; }
			if(info.nickname == "perfectorzy" && x==1) { info.tagtype="mod"; info.tagname = "Jabroni Ave"; }
			if(info.nickname == "pantallideth1" && x==1) { info.tagtype="staff"; info.tagname = "KoW"; }
			if(info.nickname == "mmmjc" && x==1) { info.tagtype="admin"; info.tagname = "m&m"; }
			if(info.nickname == "hawkeyethereaper" && x==1) { info.tagtype="broadcaster"; info.tagname = "EnVy"; info.nickname="Hawkeye"; }
			if(info.nickname == "paterandreas" && x==1) { info.tagtype="admin"; info.tagname = "Uni-BB"; }
			if(info.nickname == "the_chopsticks" && x==1) { info.tagtype="admin"; info.tagname = "oZn"; }
			if(info.nickname == "namja" && x==1) { info.tagtype="admin"; info.tagname = "Pedo"; }
			if(info.nickname == "whitesammy") { info.nickname="<span style=\"color:white;text-shadow: 0 0 2px #000;-webkit-text-shadow: 0 0 2px #000;\">" + info.nickname + "</span>"; }
			//Xmas
			if(info.nickname == "r3lapse" && x==1) { info.tagtype="staff"; info.tagname = "Kershaw"; }
			if(info.nickname == "im_tony_" && x==1) { info.tagtype="admin"; info.tagname = "oZn"; }
			if(info.nickname == "tips_" && x==1) { info.tagtype="staff"; info.tagname = "241"; }
			if(info.nickname == "papa_dot" && x==1) { info.tagtype="mod"; info.tagname = "v8"; }
			if(info.nickname == "beccamay" && x==1) { info.tagtype="orange"; info.tagname = "British"; }
			info.pro = false;
			this.insert_chat_lineOld(info);
		}

		Chat.prototype.emoticonizeOld = Chat.prototype.emoticonize;
		Chat.prototype.emoticonize = function(msg) {
			msg = replaceAll(msg, "<wbr />", "");
			msg = this.emoticonizeOld(msg);
			var regex = new RegExp(PP['login'], 'i');
			if(regex.test(msg)) {
				msg = "<span style='color:red;font-weight:bold;word-wrap: break-word;'>"+msg+"</span>";
			} else {
				msg = "<span style=\"word-wrap: break-word;\">"+msg+"</span>";
			}

			return msg;
		}

		CurrentChat.handlers.clear_chat = function(info) {
			var nickname = CurrentChat.real_username(info.user);
			if (info.target == "all") {
			this.admin_message(_("Chat was cleared by a moderator (Prevented by BetterTTV)"));
			} else if (info.target == "user") {
			var nickname = CurrentChat.real_username(info.user);
			$$('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + ' .chat_line').each(function (message) {
				message.innerHTML = "<span style=\"color: #999\">" + message.innerHTML + "</span>";
			});
			CurrentChat.insert_with_lock("#chat_line_list",'<li class="line fromjtv"><p class="content"><span style="text-transform:capitalize;">'+nickname+"</span> has been timed out."+"</p></li>");
			}
		}

		Chatters.renderOld = Chatters.render;
		Chatters.render = function(d) {
			Chatters.renderOld(d);
			if(200 === d.status) {
				CurrentViewers = [];
				["staff", "admins", "moderators", "viewers"].forEach(function (a) {
	                d.data.chatters[a].forEach(function (a) {
	                    CurrentViewers.push(a);
	                });
	            });
			}
			
		}

		$j('#chat_text_input').live('keydown', function(e) { 
		  var keyCode = e.keyCode || e.which; 
		  if (keyCode == 9) { 
		    e.preventDefault(); 
		    setInterval(function(){updateViewerList()},300000);
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
	}	

	overrideEmotes = function() {

		betterttvDebug.log("Overriding Twitch Emoticons");

		if(!document.getElementById("chat_lines")) return;

		if(localStorage.getItem("defaultemotes") == "true") {
			var defaultEmotes = true;
		} else {
			var defaultEmotes = false;
		}

		CurrentChat.emo_id = 1;
		CurrentChat.emoticons = [];
		$j.getJSON("http://betterttv.nightdev.com/faces.php?channel=" + CurrentChat.channel + "&oldemotes=" + defaultEmotes + "&user=" + PP['login'] + "&callback=?", function (a) {
				CurrentChat.emoticons = CurrentChat.emoticons.concat(a);
				for (var c, g = "", h = a.length - 1; 0 <= h; --h) c = a[h], c.image_name = CurrentChat.emo_id++, g += generateEmoticonCSS(c);
				CurrentChat.add_css_style(g + ".emoticon { display: inline-block; }");
		});

	}

	updateViewerList = function() {

		betterttvDebug.log("Updating Viewer List");

		var button = document.getElementById("chat_viewers_dropmenu_button"),
			open = document.createEvent("MouseEvents"),
			close = document.createEvent("MouseEvents");

		if ($j("#chat_viewers_dropmenu").is(':visible')) {
			checkopen = document.createEvent("MouseEvents");
			checkopen.initMouseEvent("click", true, true);
			button.dispatchEvent(checkopen);
		}

		open.initMouseEvent("click", true, true);
		button.dispatchEvent(open);

		close.initMouseEvent("click", true, true);
		button.dispatchEvent(close);

	}

	generateEmoticonCSS = function(a) {

			var b = "";
			//18 < a.height && (b = "margin: -" + (a.height - 18) / 2 + "px 0px");
			return ".emo-" + a.image_name + ' {background-image: url("' + a.url + '") !important;vertical-align: baseline !important;height: ' + a.height + "px;width: " + a.width + "px;" + b + "}"

	}

	darkenPage = function() {

		var chat = document.getElementById("chat_lines"),
			dashboard = document.getElementById("dashboard_title");

		if(!chat || dashboard) return;

		if(localStorage.getItem("darkchat") === "true") {
			$$('#chat_column').each(function(element) {
				element.style.background = '#333';
			});
			$$('#chat_lines').each(function(element) {
				element.style.background = '#333';
				element.style.color = '#FFF';
				element.style.border = '#fff';
			});
			$$('#chat_text_input').each(function(element) {
				element.style.background = '#000';
				element.style.color = '#fff';
				element.style.border = 'solid 1px #333';
				element.style.boxShadow = 'none';
			});
			$$('#right_col .content #twitch_chat .scroll').each(function(element) {
				element.style.background = '#333';
			});
			$$('#right_col').each(function(element) {
				element.style.backgroundColor = '#1E1E1E';
			});
			$$('.channel-main').each(function(element) {
				element.style.backgroundColor = '#000';
			});
			$$('#right_col .content .bottom #controls').each(function(element) {
				element.style.backgroundColor = '#1E1E1E';
				element.style.borderTop = '1px solid rgba(0, 0, 0, 0.65)';
				
			});
			$$('#player_col').each(function(element) {
				element.style.backgroundColor = '#000000';
			});
			$$('.scroll-scrollbar .drag-handle').each(function(element) {
				element.style.backgroundColor = '#ffffff';
			});
			$$('#player_col .content #left_close, #player_col .content #right_close').each(function(element) {
				element.style.backgroundColor = '#CCCCCC';
				element.style.boxShadow = 'none';
			});
			$$('#right_col .content').each(function(element) {
				element.style.borderLeft = 'none';
			});
			$$('.playing a, #team_membership a, .more_videos a').each(function(element) {
				element.style.color = '#777';
			});
			$$('#channel_panels_contain #channel_panels .panel').each(function(element) {
				element.style.color = '#999';
			});
			$$('#right_col .content #chat_line_list, body, #player_col .content #broadcast_meta .info .channel, #channel_panels_contain #channel_panels .panel h3').each(function(element) {
				element.style.color = '#fff';
			});
			$$('.segmented_tabs li a.selected, .segmented_tabs li a:active, .segmented_tabs li:last-child a').each(function(element) {
				element.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
				element.style.boxShadow = 'none';
				element.style.boxShadow = '0 1px 0 rgba(0, 0, 0, 0.65),inset 0 1px rgba(0, 0, 0, 0.05) !important';
			});
			document.body.style.background = "#000";
			$$('.noise').each(function(element) {
				element.style.backgroundImage = "none";
			});

			var darkCSS = document.createElement("style");
			darkCSS.setAttribute("type","text/css");
			darkCSS.innerHTML = '#chat_line_list a{color: #777} #right_col .content #archives .video a .title {color: #777;} #chat_line_list li a.timeout { padding-left: 18px; min-height: 18px; background: url("http://betterttv.nightdev.com/timeout.png") no-repeat !important;} #chat_line_list li a.ban { padding-left: 18px; min-height: 18px; background: url("http://betterttv.nightdev.com/ban.png") no-repeat !important; } #chat_line_list li a.unban { padding-left: 18px; min-height: 18px; background: url("http://betterttv.nightdev.com/unban.png") no-repeat !important; } #chat_line_list li .mod_button img {display:none;}';
			$j('body').append(darkCSS);
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
		if(localStorage.getItem("blockads") == "true") { blockAds = "false"; } else { blockAds = "true"; }
		if(localStorage.getItem("defaultemotes") !== "true") { defaultEmotes = "false"; } else { defaultEmotes = "true"; }
		if(localStorage.getItem("blocksub") == "true") { blockSubscriber = "false"; } else { blockSubscriber = "true"; }
		if(localStorage.getItem("related") !== "true") { blockRelated = "false"; } else { blockRelated = "true"; }
		if(localStorage.getItem("hidemeebo") !== "true") { hideMeebo = "false"; } else { hideMeebo = "true"; }
		if(localStorage.getItem("darkchat") == "true") { darken = "Undarken Chat"; } else { darken = "Darken Chat"; }
		
		bttvSettings.innerHTML = '<ul class="dropmenu_col inline_all"> \
							<li id="chat_section_chatroom" class="dropmenu_section"> \
							<br /> \
							&nbsp;&nbsp;&nbsp;&raquo;&nbsp;BetterTTV \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="darkchatlink" onclick="betterttvAction(\'toggledark\'); return false;">' + darken + '</a> \
							<a class="dropmenu_action g18_trash-FFFFFF80" href="#" onclick="betterttvAction(\'clear\'); return false;">Clear My Chat</a> \
							<p onclick="betterttvAction(\'defaultemotes\');document.getElementById(\'defaultemotes\').checked=' + defaultEmotes + ';" class="dropmenu_action"> \
							<input type="checkbox" id="defaultemotes" class="left"> Default Emoticons</p> \
							<p onclick="betterttvAction(\'narrowchat\');document.getElementById(\'narrowchat\').checked=' + narrowChat + ';" class="dropmenu_action"> \
							<input type="checkbox" id="narrowchat" class="left"> Narrow Chat</p> \
							<p onclick="betterttvAction(\'blockads\');document.getElementById(\'blockads\').checked=' + blockAds + ';" class="dropmenu_action"> \
							<input type="checkbox" id="blockads" class="left"> Block Video Ads</p> \
							<p onclick="betterttvAction(\'blocksub\');document.getElementById(\'blocksub\').checked=' + blockSubscriber + ';" class="dropmenu_action"> \
							<input type="checkbox" id="blocksub" class="left"> Hide Subscribe Button</p> \
							<p onclick="betterttvAction(\'togglemeebo\');document.getElementById(\'hidemeebo\').checked=' + hideMeebo + ';" class="dropmenu_action"> \
							<input type="checkbox" id="hidemeebo" class="left"> Hide Meebo</p> \
							<p onclick="betterttvAction(\'related\');document.getElementById(\'related\').checked=' + blockRelated + ';" class="dropmenu_action"> \
							<input type="checkbox" id="related" class="left"> Show Related Channels</p> \
							</li> \
							</ul> \
							<center> \
							<form action="https://www.paypal.com/cgi-bin/webscr" method="post"> \
							<input type="hidden" name="cmd" value="_s-xclick"> \
							<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----"> \
							<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"> \
							<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"> \
							</form> \
							</center>';

		settingsMenu.appendChild(bttvSettings);

		$$('.dropmenu_action').each(function(element) {
			element.style.color = "#ffffff";
		});

		if(localStorage.getItem("narrowchat") == "yes") document.getElementById("narrowchat").checked = true;
		if(localStorage.getItem("blockads") == "true") document.getElementById("blockads").checked = true;
		if(localStorage.getItem("defaultemotes") == "true") document.getElementById("defaultemotes").checked = true;
		if(localStorage.getItem("blocksub") == "true") document.getElementById("blocksub").checked = true;
		if(localStorage.getItem("related") == "true") document.getElementById("related").checked = true;
		if(localStorage.getItem("hidemeebo") == "true") document.getElementById("hidemeebo").checked = true;
	}

	betterttvAction = function(action) {
		if(action == "clear") {
			$('chat_line_list').innerHTML = "";
			CurrentChat.admin_message("You cleared your own chat (BetterTTV)");
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
		if(action == "blockads") {
			if(localStorage.getItem("blockads") == "true") {
				localStorage.setItem("blockads", "false");
			} else {
				localStorage.setItem("blockads", "true");
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
		if(action == "related") {
			if(localStorage.getItem("related") == "true") {
				localStorage.setItem("related", "false");
			} else {
				localStorage.setItem("related", "true");
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

	betterttvDebug.log("BTTV v"+betterttvVersion);
	betterttvDebug.log("CALL init "+document.URL);
	brand();
	directoryReformat();
	channelReformat();
	blockVideoAds();
	chatReformat();
	newChannelReformat();
	clearAds();
	darkenPage();
	setTimeout(clearAds, 1000);
	setTimeout(clearAds, 5000);
	setTimeout(chatFunctions, 1000);
	setTimeout(createSettingsMenu, 1000);
	setTimeout(overrideEmotes, 1000);
	setTimeout(meeboReformat, 5000);

}();