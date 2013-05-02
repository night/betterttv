/**
 * Copyright (c) 2013 NightDev
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

BetterTTVEngine = function() {

	var betterttvVersion = "6.2.5",
		betterttvDebug = {
			log: function(string) { if(window.console && console.log) console.log("BTTV: "+string); },
			warn: function(string) { if(window.console && console.warn) console.warn("BTTV: "+string); },
			error: function(string) { if(window.console && console.error) console.error("BTTV: "+string); },
			info: function(string) { if(window.console && console.info) console.info("BTTV: "+string); }
		},
		liveChannels = [],
		blackChat = false,
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

		$$(e).each(function(e){ e.hide(); });

	}

	displayElement = function(e) {

		$$(e).each(function(e){ e.show(); });

	}

	escapeRegExp = function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
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

		if(localStorage.getItem("showFeaturedChannels") !== "true") {
			removeElement('.sm_vids');
			removeElement('#nav_games');
			removeElement('#nav_streams');
			removeElement('.featured');
			removeElement('.related');
		}

		if(localStorage.getItem("blockSubButton") == "true") {
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
			});
		}
		
		$j("#chat_line_list").css({
			fontSize: "13.33333px",
			lineHeight: "17.333333px",
		});

		$j('#chat_loading_spinner').attr('src',"data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");
		
	}

	newChannelReformat = function() {

		betterttvDebug.log("Reformatting Beta Channel Page");

		if($j(".betabar").length === 0) return;
		
		if(localStorage.getItem("chatWidth")) {
			if(localStorage.getItem("chatWidth") < 0) {
				localStorage.setItem("chatWidth", 0)
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

			$j("#left_close").click(function(a) {
				$j(window).trigger('resize');
			});
			
			var handleResize = function() {
				var d = 0;
				if($j("#large_nav").css("display") !== "none") {
					d += $j("#large_nav").width();
				}
				if($j("#small_nav").css("display") !== "none") {
					d += $j("#small_nav").width();
				}
				if(chatWidth == 0) {
					$j("#right_col").css({
	            		display: "none"
			        });
			        $j("#right_close").css({
			            "background-position": "0 0"
			        });
				}
				if($j("#right_col").css("display") !== "none") {
					if($j("#right_col").width() < 320) {
						chatWidth = 320;
						$j("#right_col").width(chatWidth);
						$j("#right_col .content #chat").width(chatWidth);
						$j("#right_col .content .top").width(chatWidth);
						$j("#chat_line_list").width(chatWidth);
						$j("#chat_lines").width(chatWidth);
						$j("#right_col").css("display","none");
						$j("#right_close").css({
				            "background-position": "0 0"
				        });
					} else {
						d += $j("#right_col").width();
					}
				}

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
		        
		        $j("body").trigger("fluid-resize")
			}

			if(localStorage.getItem("chatWidth")) {
				chatWidth = localStorage.getItem("chatWidth");

				if(chatWidth == 0) {
					console.log("here")
					$j("#right_col").css({
	            		display: "none"
			        });
			        $j("#right_close").css({
			            "background-position": "0 0"
			        });
				} else {
					$j("#right_col").width(chatWidth);
					$j("#right_col .content #chat").width(chatWidth);
					$j("#right_col .content .top").width(chatWidth);

					$j("#chat_line_list").width(chatWidth);
					$j("#chat_lines").width(chatWidth);
				}

				handleResize();
			} else {
				chatWidth = $j("#right_col").width();
				localStorage.setItem("chatWidth", $j("#right_col").width());
			}

			$j(document).mouseup(function(event)
			{
				if(resize == false) return;
				if(chatWidthStartingPoint) {
					if(chatWidthStartingPoint === event.pageX) {
						if($j("#right_col").css("display") !== "none") {
							$j("#right_col").css({
			            		display: "none"
					        });
					        $j("#right_close").css({
					            "background-position": "0 0"
					        });
					        chatWidth = 0
						}
					} else {
						chatWidth = $j("#right_col").width();
					}
				} else {
					chatWidth = $j("#right_col").width();
				}
				localStorage.setItem("chatWidth", chatWidth);

				resize = false;
				handleResize();
			});

			$j("#right_close, #right_col .resizer").mousedown(function(event)
			{
				resize = event.pageX;
				chatWidthStartingPoint = event.pageX;
				$j("#chat_text_input").focus();
				if($j("#right_col").css("display") === "none") {
			        $j("#right_col").css({
			            display: "inherit"
			        });
			        $j("#right_close").css({
			            "background-position": "0 -18px"
			        });
					resize = false;
					if($j("#right_col").width() < 320) {
						$j("#right_col").width($j("#right_col .content .top").width());
					}
					chatWidth = $j("#right_col").width();
					localStorage.setItem("chatWidth", chatWidth);
			        handleResize();
				}
			});
		
			$j(document).mousemove(function(event)
			{

				if (resize)
				{
					$j("#chat_text_input").focus();
					if (chatWidth + resize - event.pageX < 320)
					{
						$j("#right_col").width(320);
						$j("#right_col .content #chat").width(320);
						$j("#right_col .content .top").width(320);
						$j("#chat_line_list").width(320);
						$j("#chat_lines").width(320);

						handleResize();
					}
					else if (chatWidth + resize - event.pageX > 541)
					{
						$j("#right_col").width(541);
						$j("#right_col .content #chat").width(541);
						$j("#right_col .content .top").width(541);
						$j("#chat_line_list").width(541);
						$j("#chat_lines").width(541);

						handleResize();
					}
					else
					{
						$j("#right_col").width(chatWidth + resize - event.pageX);
						$j("#right_col .content #chat").width(chatWidth + resize - event.pageX);
						$j("#right_col .content .top").width(chatWidth + resize - event.pageX);
						$j("#chat_line_list").width(chatWidth + resize - event.pageX);
						$j("#chat_lines").width(chatWidth + resize - event.pageX);

						handleResize();
					}
				}
			});

			$j(window).resize(function() {
				setTimeout(handleResize, 1000);
			});

			$j(window).on("fluid-resize", function () {
				//setTimeout(handleResize, 1000);
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

		if(!$j("body#chat").length) {
			meebo();
		}
		
	}

	checkMessages = function(videopage) {

		betterttvDebug.log("Checking for New Messages");

		if(Twitch.user.isLoggedIn() && window.FirebaseRootNamespaced) {
			PP['notificationsLoaded'] = false;
			PP['notifications'] = 0;
	        window.FirebaseRootNamespaced.child("users/" + Twitch.user.userId() + "/messages").on("value", function (f) {
	        	var f = f.val() || {}, j = f.unreadMessagesCount;
	            $j(".js-unread_message_count").html("<img src='http://www-cdn.jtvnw.net/images/xarth/g/g18_mail-FFFFFF80.png' /> "+j || "");
	            j ? $j(".js-unread_message_count").show() : $j(".js-unread_message_count").hide();
	            if(PP['notificationsLoaded'] === true && PP['notifications'] < j) {
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
	            }
	            PP['notifications'] = j;
	            PP['notificationsLoaded'] = true;
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
		$j('.meebo-22').replaceWith('<a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=1" style="margin-right:5px;margin-bottom:3px;color:black;" class="normal_button"><span>Report a BetterTTV Bug</span></a><a href="http://www.betterttv.com" style="margin-right:7px;margin-bottom:3px;color:black;" class="normal_button"><span>BetterTTV v'+betterttvVersion+'</span></a>');

	}

	meebo = function() {

		betterttvDebug.log("Handling the Meebo Bar");

		if(localStorage.getItem("hideMeebo") !== "true") {
			$j("#left_col").css("bottom","35px");
			$j("#right_col").css("bottom","35px");
			$j("#directory-list").css("margin-bottom","50px");
			$j("#main_col .content .scroll .scroll-content-contain").css("margin-bottom","35px");
		}

		try {

			if(PP.login != "justin" && localStorage.getItem("hideMeebo") !== "true") {

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
			if(currentViewers && currentViewers.indexOf(info.nickname) === -1 && info.nickname !== "jtv") {
				currentViewers.push(info.nickname);
			}

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
			
			if(localStorage.getItem("showDefaultTags") == "true") {
				if(info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin" || info.tagtype == "staff") info.tagtype = "old"+info.tagtype;
			}

			var messageHighlighted = false;
			var regexInput = PP['login'];

			if(localStorage.getItem("highlightKeywords")) {
				var highlightKeywords = localStorage.getItem("highlightKeywords");
				highlightKeywords = highlightKeywords.split(" ");
				highlightKeywords.forEach(function(keyword){
					regexInput += "|" + escapeRegExp(keyword);
				});
			}

			var wordRegex = new RegExp('\\b('+regexInput+')\\b', 'i');
			var symbolRegex = new RegExp('\\B('+regexInput+')\\B', 'i');

			if(PP['login'] !== "" && (wordRegex.test(info.message) || symbolRegex.test(info.message))) {
				messageHighlighted = true;
			}

			if(blackChat === true && info.color === "#000000") {
				info.color = "#ffffff";
			}

			if(messageHighlighted === true && localStorage.getItem("darkenedMode") == "true") {
				info.color = "#ffffff";
				ich.templates["chat-line"] = ich.templates["chat-line-highlight"];
				ich.templates["chat-line-action"] = ich.templates["chat-line-action-highlight"];
			} else if(messageHighlighted === true && PP['login'] !== "") {
				info.color = "#000000";
				ich.templates["chat-line"] = ich.templates["chat-line-highlight"];
				ich.templates["chat-line-action"] = ich.templates["chat-line-action-highlight"];
			} else {
				ich.templates["chat-line"] = ich.templates["chat-line-old"];
				ich.templates["chat-line-action"] = ich.templates["chat-line-action-old"];
			}

			if((info.color == "#0000FF" || info.color == "#191971") && localStorage.getItem("darkenedMode") == "true") { info.color = "#3753ff"; }

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
			if(info.nickname == "frontiersman72" && x==1) { info.tagtype="admin"; info.tagname = "TMC"; }
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
			if(info.nickname == "zebbazombies" && x==1) { info.tagtype="mod"; info.tagname = "Hugs"; }
			if(info.nickname == "nobama12345" && x==1) { info.tagtype="broadcaster"; info.tagname = "Señor"; }
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
			
			//this.insert_chat_lineOld(info);
			if (!(CurrentChat.restarting && !CurrentChat.history_ended || CurrentChat.ignored[info.sender])) if ("jtv" === info.sender) CurrentChat.last_sender = info.sender, CurrentChat.admin_message(CurrentChat.format_message(info));
	        else if (!info.is_action && CurrentChat.last_sender && CurrentChat.last_sender === info.sender && "jtv" !== CurrentChat.last_sender) CurrentChat.insert_with_lock("#chat_line_list li:last", '<p class="chat_line" style="display:block;">&raquo; ' + CurrentChat.format_message(info) + "</p>");
	        else {
	            CurrentChat.last_sender = info.sender;
	            var d = !! (PP.login === PP.channel || "true" ===
	                PP.is_admin || "true" === PP.is_subadmin || CurrentChat.staff[PP.login] || CurrentChat.admins[PP.login] || CurrentChat.moderators[PP.login]),
	                c = info.is_action ? "chat-line-action" : "chat-line",
	                b = !1,
	                f = unescape(info.nickname);
	            0 === f.indexOf("ign-") && (b = !0, f = f.substr(4));
	            var h = "chat-line-" + Math.round(1E9 * Math.random()),
	                f = {
	                    id: h,
	                    showModButtons: d && "jtv" !== info.sender && info.sender !== PP.login,
	                    timestamp: CurrentChat.show_timestamps || !CurrentChat.history_ended ? info.timestamp : "",
	                    sender: info.sender,
	                    displayname: f,
	                    color: info.color
	                }, g = d = "";
	            info.tagtype && (d = '<span class="tag %tagtype" title="%tagname">%tagname</span>&nbsp;'.replace(/\%tagtype/g,
	                info.tagtype).replace(/\%tagname/g, info.tagname));
	            info.turbo && (d += '<span class="tag %tagtype" title="%tagname"><a href="/products/turbo?ref=chat_badge" target="_blank">%tagname</a></span> '.replace(/\%tagtype/g, "turbo").replace(/\%tagname/g, "Turbo"));
	            info.subscriber && (g = '<span class="tag %tagtype %tagchannel" title="%tagname">' + ('<a href="/' + CurrentChat.channel + '/subscribe" target="_blank">%tagname</a>'), d += (g + "</span> ").replace(/\%tagtype/g, "subscriber").replace(/\%tagname/g, "Subscriber").replace(/\%tagchannel/g,
	                CurrentChat.channel));
	            b && (d += '<span class="tag %tagtype" title="%tagname">%tagname</span>&nbsp;'.replace(/\%tagtype/g, "ign").replace(/\%tagname/g, "My IGN"));
	            c = ich[c](f)[0].outerHTML;
	            c = c.replace(/\@tag/g, d);
	            c = c.replace(/\@message/g, CurrentChat.format_message(info));
	            "jtv" !== info.sender ? CurrentChat.insert_with_lock("#chat_line_list", c, info, h) : CurrentChat.insert_with_lock("#chat_line_list", c)
	        }
		}

		ich.templates["chat-line-action"] = "<li class='chat_from_{{sender}} line' data-sender='{{sender}}'><p><span class='small'>{{timestamp}}&nbsp;</span>@tag{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}<a class='nick' href='/{{sender}}' id='{{id}}' style='color:{{color}};'>{{displayname}}</a><span class='chat_line' style='color:{{color}};'> @message</span></p></li>";
		ich.templates["chat-line-action-highlight"] = "<li class='chat_from_{{sender}} line highlight' data-sender='{{sender}}'><p><span class='small'>{{timestamp}}&nbsp;</span>@tag{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}<a class='nick' href='/{{sender}}' id='{{id}}' style='color:{{color}};'>{{displayname}}</a><span class='chat_line' style='color:{{color}};'> @message</span></p></li>";
		ich.templates["chat-line-highlight"] = "<li class='chat_from_{{sender}} line highlight' data-sender='{{sender}}'><p><span class='small'>{{timestamp}}&nbsp;</span>@tag{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}<a class='nick' href='/{{sender}}' id='{{id}}' style='color:{{color}};'>{{displayname}}</a>:&nbsp;<span class='chat_line'>@message</span></p></li>";
		ich.templates["chat-line-old"] = ich.templates["chat-line"];
		ich.templates["chat-line-action-old"] = ich.templates["chat-line-action"];

		var purge = '<span><a href="#" class="normal_button tooltip chat_menu_btn" onclick="javascript:CurrentChat.ghettoTimeout(1);" title="Temporary 8 hour ban"><span class="glyph_only"><img src="http://betterttv.nightdev.com/purge.png" /></span></a>&nbsp;</span>';
		$j(purge).insertBefore("#chat_menu_timeout");
		var tempBan = '<span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn" onclick="javascript:CurrentChat.ghettoTimeout(28800);" title="Temporary 8 hour ban"><span class="glyph_only"><img src="http://betterttv.nightdev.com/8hr.png" /></span></a></span><span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn" onclick="javascript:CurrentChat.ghettoTimeout(86400);" title="Temporary 24 hour ban"><span class="glyph_only"><img src="http://betterttv.nightdev.com/24hr.png" /></span></a></span>';
		$j(tempBan).insertAfter("#chat_menu_timeout");
		$j("#chat_menu_tools").insertAfter("#chat_menu_op_tools");

		CurrentChat.TMIFailedToJoin = true;
		CurrentChat.TMIFailedToJoinTries = 1;

		var checkJoinFail = {};

		CurrentChat.ghettoTimeout = function(time) {
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

		/*$j(document).keyup(function(event){
			if(event.keyCode === 90 && event.altKey) {
		  		CurrentChat.currently_scrolling = 1;
			}
		});

		$j(document).keydown(function(event){
			if(event.keyCode === 90 && event.altKey) {
				event.preventDefault();
		  		CurrentChat.currently_scrolling = 0;
			}
		});*/

		$j('#chat_text_input').live('keydown', function(e) { 
		  var keyCode = e.keyCode || e.which; 
		  if (keyCode == 9) { 
		    e.preventDefault(); 
		    var sentence = $j('#chat_text_input').val().split(' ');
		    var partialMatch = sentence.pop().toLowerCase();
		    var users = currentViewers;
			var userIndex = 0;
			if(window.partialMatch === undefined) {
			  window.partialMatch = partialMatch;
			} else if(partialMatch.search(window.partialMatch) !== 0){
			  window.partialMatch = partialMatch;
			} else if(window.lastMatch !== $j('#chat_text_input').val()) {
			  window.partialMatch = partialMatch;
			} else {
			  if (sentence.length === 0) {
			    userIndex = users.indexOf(partialMatch.substr(0, partialMatch.length-1));
			  } else {
			    userIndex = users.indexOf(partialMatch);
			  }
			  if (e.shiftKey) {
			  	userIndex = userIndex-1;
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
			      $j('#chat_text_input').val(sentence.join(' ')+":");
			      window.lastMatch = sentence.join(' ')+":";
			    } else {
			      $j('#chat_text_input').val(sentence.join(' '));
			      window.lastMatch = sentence.join(' ');
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
				Twitch.api.get("channels/"+f.name.toLowerCase()).done(function (d) {
					if(d.name) {
						$j.gritter.add({
					        title: d.display_name+' is Now Streaming',
					        image: d.logo,
					        text: d.display_name+' just started streaming '+d.game+'.<br /><br /><a style="color:white" href="http://www.twitch.tv/'+d.name+'">Click here to head to '+d.display_name+'\'s channel</a>.',
					    });
					}
				});
			}
		});

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
								{ url: "http://betterttv.nightdev.com/emotes/bacon.gif", width: 33, height: 35, regex: "BaconTime" },
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
                    if(oldEmotes.indexOf(a.url) !== -1 && localStorage.getItem("showDefaultEmotes") !== "true") {
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
            url: "https://tmi.twitch.tv/group/user/" + PP['channel']+ "/chatters?update_num=" + Math.random() + "&callback=?",
            cache: !1,
            dataType: "jsonp",
            timeoutLength: 6E3
        }).done(function (d) {
        	if(d.data.chatters) {
            	currentViewers = [];
				["staff", "admins", "moderators", "viewers"].forEach(function (a) {
	                d.data.chatters[a].forEach(function (a) {
	                    currentViewers.push(a);
	                });
	            });
        	}
        });

	}

	darkenPage = function() {

		betterttvDebug.log("Darkening Chat");

		if(PP['page_type'] === "video" || PP['page_type'] === "channel" || ($j("#twitch_chat").length && !$j("#dash_main").length)) {
			if(localStorage.getItem("darkenedMode") == "true") {
				var darkCSS = document.createElement("link");
				darkCSS.setAttribute("href","http://betterttv.nightdev.com/betterttv-dark.css");
				darkCSS.setAttribute("type","text/css");
				darkCSS.setAttribute("rel","stylesheet");
				darkCSS.setAttribute("id","darkTwitch");
				darkCSS.innerHTML = '';
				$j('body').append(darkCSS);

				$j("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display","none");
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
		
		bttvSettings.innerHTML = '<ul class="dropmenu_col inline_all"> \
							<li id="chat_section_chatroom" class="dropmenu_section"> \
							<br /> \
							&nbsp;&nbsp;&nbsp;&raquo;&nbsp;BetterTTV \
							<form id="bttvTipJar" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"> \
								<input type="hidden" name="cmd" value="_xclick"> \
								<input type="hidden" name="business" value="night@nightdev.com"> \
								<input type="hidden" name="lc" value="US"> \
								<input type="hidden" name="item_name" value="BetterTTV Tip Jar"> \
								<input type="hidden" name="item_number" value="'+PP['login']+'"> \
								<input type="hidden" name="amount" value=""> \
								<input type="hidden" name="currency_code" value="USD"> \
								<input type="hidden" name="button_subtype" value="services"> \
								<input type="hidden" name="no_note" value="0"> \
								<input type="hidden" name="cn" value="Leave a message:"> \
								<input type="hidden" name="no_shipping" value="1"> \
								<input type="hidden" name="bn" value="PP-BuyNowBF:btn_buynowCC_LG.gif:NonHosted"> \
								<a href="#" class="dropmenu_action g18_popout-FFFFFF80" onclick="document.getElementById(\'bttvTipJar\').submit();">BetterTTV Tip Jar</a> \
							</form> \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="darkenTwitchLink" onclick="betterttvAction(\'toggleDarkTwitch\'); return false;">' + (localStorage.getItem("darkenedMode") == "true" ? "Undarken Chat":"Darken Chat") + '</a> \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="blackChatLink" onclick="betterttvAction(\'toggleBlackChat\'); return false;">Black Chat (Chroma Key)</a> \
							<a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="betterttvAction(\'setHighlightKeywords\'); return false;">Set Highlight Keywords</a> \
							<a class="dropmenu_action g18_trash-FFFFFF80" href="#" onclick="betterttvAction(\'clearChat\'); return false;">Clear My Chat</a> \
							<p onclick="betterttvAction(\'toggleDefaultEmotes\');" class="dropmenu_action"> \
							<input type="checkbox" id="defaultEmotesCheckbox" class="left"> Default Emoticons</p> \
							<p onclick="betterttvAction(\'toggleDefaultTags\');" class="dropmenu_action"> \
							<input type="checkbox" id="defaultTagsCheckbox" class="left"> Default Chat Tags</p> \
							<p onclick="betterttvAction(\'narrowchat\');" class="dropmenu_action"> \
							<input type="checkbox" id="narrowChatCheckbox" class="left"> Narrow Chat</p> \
							<p onclick="betterttvAction(\'toggleBlockSubButton\');" class="dropmenu_action"> \
							<input type="checkbox" id="blockSubButtonCheckbox" class="left"> Hide Subscribe Button</p> \
							<p onclick="betterttvAction(\'toggleMeebo\');" class="dropmenu_action"> \
							<input type="checkbox" id="hideMeeboCheckbox" class="left"> Hide Meebo</p> \
							<p onclick="betterttvAction(\'toggleFeaturedChannels\');" class="dropmenu_action"> \
							<input type="checkbox" id="featuredChannelsCheckbox" class="left"> Show Featured Channels</p> \
							</li> \
							</ul> \
							';

		settingsMenu.appendChild(bttvSettings);

		$$('.dropmenu_action').each(function(element) {
			element.style.color = "#ffffff";
		});

		if(localStorage.getItem("narrowchat") == "yes") $j('#narrowChatCheckbox').prop('checked', true);
		if(localStorage.getItem("showDefaultEmotes") == "true") $j('#defaultEmotesCheckbox').prop('checked', true);
		if(localStorage.getItem("showDefaultTags") == "true") $j('#defaultTagsCheckbox').prop('checked', true);
		if(localStorage.getItem("blockSubButton") == "true") $j('#blockSubButtonCheckbox').prop('checked', true);
		if(localStorage.getItem("showFeaturedChannels") == "true") $j('#featuredChannelsCheckbox').prop('checked', true);
		if(localStorage.getItem("hideMeebo") == "true") $j('#hideMeeboCheckbox').prop('checked', true);
	}

	betterttvAction = function(action) {
		if(action == "clearChat") {
			$j('#chat_line_list').html("");
			CurrentChat.admin_message("You cleared your own chat (BetterTTV)");
		}
		if(action == "setHighlightKeywords") {
			var keywords = prompt("Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords.",localStorage.getItem("highlightKeywords"));
			if (keywords != null) {
				localStorage.setItem("highlightKeywords", keywords);
				var keywords = keywords.split(" ");
				var keywordList = PP['login'];
				keywords.forEach(function(keyword){ keywordList += ", " + keyword; });
				CurrentChat.admin_message("Highlight Keywords are now set to: "+keywordList);
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
		if(action == "toggleDefaultEmotes") {
			if(localStorage.getItem("showDefaultEmotes") == "true") {
				localStorage.setItem("showDefaultEmotes", false);
			} else {
				localStorage.setItem("showDefaultEmotes", true);
			}
			overrideEmotes();
		}
		if(action == "toggleDefaultTags") {
			if(localStorage.getItem("showDefaultTags") == "true") {
				localStorage.setItem("showDefaultTags", false);
			} else {
				localStorage.setItem("showDefaultTags", true);
			}
		}
		if(action == "toggleMeebo") {
			if(localStorage.getItem("hideMeebo") == "true") {
				localStorage.setItem("hideMeebo", false);
			} else {
				localStorage.setItem("hideMeebo", true);
			}
			window.location.reload();
		}
		if(action == "toggleDarkTwitch") {
			if(localStorage.getItem("darkenedMode") == "true") {
				localStorage.setItem("darkenedMode", false);
				$j("#darkTwitch").remove();
				$j("#darkenTwitchLink").html("Darken Twitch");
			} else {
				localStorage.setItem("darkenedMode", true);
				darkenPage();
				$j("#darkenTwitchLink").html("Undarken Twitch");
			}
		}
		if(action == "toggleBlackChat") {
			if(blackChat) {
				blackChat = false;
				$j("#blackChat").remove();
				darkenPage();
				$j("#blackChatLink").html("Black Chat (Chroma Key)");
			} else {
				blackChat = true;
				$j("#darkTwitch").remove();
				var darkCSS = document.createElement("link");
				darkCSS.setAttribute("href","http://betterttv.nightdev.com/betterttv-blackchat.css");
				darkCSS.setAttribute("type","text/css");
				darkCSS.setAttribute("rel","stylesheet");
				darkCSS.setAttribute("id","blackChat");
				darkCSS.innerHTML = '';
				$j('body').append(darkCSS);
				$j("#blackChatLink").html("Unblacken Chat");
			}
		}
		if(action == "toggleBlockSubButton") {
			if(localStorage.getItem("blockSubButton") == "true") {
				localStorage.setItem("blockSubButton", false);
				$j("#sub-details").css("display", "inline");
			} else {
				localStorage.setItem("blockSubButton", true);
				$j("#sub-details").css("display", "none");
			}
		}
		if(action == "toggleFeaturedChannels") {
			if(localStorage.getItem("showFeaturedChannels") == "true") {
				localStorage.setItem("showFeaturedChannels", false);
				removeElement('.sm_vids');
				removeElement('#nav_games');
				removeElement('#nav_streams');
				removeElement('.featured');
				removeElement('.related');
			} else {
				localStorage.setItem("showFeaturedChannels", true);
				displayElement('.sm_vids');
				displayElement('#nav_games');
				displayElement('#nav_streams');
				displayElement('.featured');
				displayElement('.related');
			}
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
	channelReformat();
	chatReformat();
	newChannelReformat();
	checkMessages();
	clearAds();
	checkFollowing();
	darkenPage();
	$j(window).trigger('resize');
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