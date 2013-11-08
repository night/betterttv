/** @license
 * Copyright (c) 2013 NightDev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without limitation of the rights to use, copy, modify, merge,
 * and/or publish copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice, any copyright notices herein, and this permission
 * notice shall be included in all copies or substantial portions of the Software,
 * the Software, or portions of the Software, may not be sold for profit, and the
 * Software may not be distributed nor sub-licensed without explicit permission
 * from the copyright owner.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Should any questions arise concerning your usage of this Software, or to
 * request permission to distribute this Software, please contact the copyright
 * holder at http://nightdev.com/contact
 *
 * ---------------------------------
 *
 *  Unofficial TLDR:
 *  Free to modify for personal use
 *  Need permission to distribute the code
 *  Can't sell addon or features of the addon
 *  
 */
/** @license
 * Gritter for jQuery
 * http://www.boedesign.com/
 *
 * Copyright (c) 2012 Jordan Boesch
 * Dual licensed under the MIT and GPL licenses.
 */

(function(bttv) {
    // Declare public and private variables
    var debug = {
        log: function (string) {
            if (window.console && console.log) console.log("BTTV: " + string);
        },
        warn: function (string) {
            if (window.console && console.warn) console.warn("BTTV: " + string);
        },
        error: function (string) {
            if (window.console && console.error) console.error("BTTV: " + string);
        },
        info: function (string) {
            if (window.console && console.info) console.info("BTTV: " + string);
        }
    },
    vars = {
        settings: {},
        currentViewers: [],
        liveChannels: [],
        blackChat: false
    };
    bttv.settings = {
        get: function(setting) {
            return vars.settings[setting];
        },
        load: function () {
            var parseSetting = function(value) {
                if(value == null) {
                    return null;
                } else if(value === "true") {
                    return true;
                } else if(value === "false") {
                    return false;
                } else if(value === "") {
                    return "";
                } else if(isNaN(value) === false) {
                    return parseInt(value);
                } else {
                    return value;
                }
            }
            var settingsList = [
                "adminStaffAlert",
                "antiPrefix",
                "blacklistKeywords",
                "bttvChat",
                "bttvEmotes",
                "bttvHLS",
                "chatWidth",
                "clickTwitchEmotes",
                "darkenedMode",
                "dblclickTranslation",
                "desktopNotifications",
                "flipDashboard",
                "hideDeletedMessages",
                "highlightKeywords",
                "scrollbackAmount",
                "selfHighlights",
                "showDefaultEmotes",
                "showDefaultTags",
                "showDeletedMessages",
                "showDirectoryLiveTab",
                "showFeaturedChannels",
                "showModIcons",
                "showPurpleButtons",
                "showTimestamps",
                "splitChat"
            ];
            settingsList.forEach(function(setting) {
                vars.settings[setting] = parseSetting(bttv.storage.get(setting));
            });
            bttv.storage.putArray("bttvReadNotifications", []);
        },
        save: function(setting, value) {
            ga('send', 'event', 'BTTV', 'Change Setting: '+setting+'='+value);
            vars.settings[setting] = value;
            bttv.storage.put(setting, value);
        }
    },
    bttv.storage = {
        exists: function(item) {
            return (bttv.storage.get(item) ? true : false);
        },
        get: function(item) {
            return localStorage.getItem(item);
        },
        getArray: function(item) {
            if(!bttv.storage.exists(item)) bttv.storage.putArray(item, []);
            return JSON.parse(bttv.storage.get(item));
        },
        put: function(item, value) {
            localStorage.setItem(item, value);
        },
        pushArray: function(item, value) {
            if(!bttv.storage.exists(item)) bttv.storage.putArray(item, []);
            var i = bttv.storage.getArray(item);
            i.push(value);
            bttv.storage.putArray(item, i);
        },
        putArray: function(item, value) {
            bttv.storage.put(item, JSON.stringify(value));
        },
        spliceArray: function(item, value) {
            if(!bttv.storage.exists(item)) bttv.storage.putArray(item, []);
            var i = bttv.storage.getArray(item);
            if(i.indexOf(value) !== -1) i.splice(i.indexOf(value), 1);
            bttv.storage.putArray(item, i);
        }
    },
    bttv.info = {
        version: "6.5.5",
        release: 2
    };
    bttv.socketServer = false;

    bttv.notify = function(message, title, url, image, tag) {
        var title = title || "Notice",
            url = url || "",
            image = image || "//cdn.betterttv.net/style/logos/bttv_logo.png",
            message = message || "",
            tag = tag || "bttv_"+message,
            tag = "bttv_"+tag.toLowerCase().replace(/[^\w_]/g, '');

        var desktopNotify = function(message, title, url, image, tag) {
            if(bttv.storage.getArray("bttvReadNotifications").indexOf(tag) === -1) {
                var notification = new window.Notification(title, {
                    icon: image,
                    body: message,
                    tag: tag
                });
                notification.onshow = function() {
                    setTimeout(function() {
                        notification.close();
                    }, 10000)
                }
                if(url !== "") {
                    notification.onclick = function() {
                        window.open(url);
                        notification.close();
                    }
                }
                bttv.storage.pushArray("bttvReadNotifications", tag);
                setTimeout(function() { bttv.storage.spliceArray("bttvReadNotifications", tag); }, 60000);
            }
        }

        if(bttv.settings.get("desktopNotifications") === true && ((window.Notification && Notification.permission === 'granted') || (window.webkitNotifications && webkitNotifications.checkPermission() === 0))) {
            desktopNotify(message, title, url, image, tag);
        } else {
            message = message.replace(/\n/g, "<br /><br />").replace(/Click here(.*)./, '<a style="color:white" target="_blank" href="'+url+'">Click here$1.</a>');
            $.gritter.add({
                title: title,
                image: image,
                text: message,
            });
        }
    }

    // Helper Functions
    var removeElement = function (e) {
            // Removes all of an element
            $(e).each(function () {
                $(this).hide();
            });
        },
        displayElement = function (e) {
            // Displays all of an element
            $(e).each(function () {
                $(this).show();
            });
        },
        escapeRegExp = function (text) {
            // Escapes an input to make it usable for regexes
            return text.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
        },
        calculateColorBackground = function (color) {
            // Converts HEX to YIQ to judge what color background the color would look best on
            color = String(color).replace(/[^0-9a-f]/gi, '');
            if (color.length < 6) {
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }

            var r = parseInt(color.substr(0, 2), 16);
            var g = parseInt(color.substr(2, 2), 16);
            var b = parseInt(color.substr(4, 2), 16);
            var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            return (yiq >= 128) ? "dark" : "light";
        },
        calculateColorReplacement = function (color, background) {
            // Modified from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
            var inputColor = color,
                rgb = "#",
                brightness, c, i;

            color = String(color).replace(/[^0-9a-f]/gi, '');
            if (color.length < 6) {
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }

            (background === "light") ? (brightness = "0.2") : (brightness = "-0.5");

            for (i = 0; i < 3; i++) {
                c = parseInt(color.substr(i * 2, 2), 16);
                if(c < 10) c = 10;
                c = Math.round(Math.min(Math.max(0, c + (c * brightness)), 255)).toString(16);
                rgb += ("00" + c).substr(c.length);
            }

            if(inputColor === rgb) {
                console.log("Color did not change: "+inputColor);
                if(background === "light") {
                    return "#ffffff";
                } else {
                    return "#000000";
                }
            } else {
                return rgb;
            }
        },
        getRgb = function(color) {
            // Convert HEX to RGB
            var regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
            return regex ? {
                r: parseInt(regex[1], 16),
                g: parseInt(regex[2], 16),
                b: parseInt(regex[3], 16)
            } : {
                r: 0,
                g: 0,
                b: 0
            };
        },
        getHex = function(color) {
            // Convert RGB object to HEX String
            var convert = function(c) {
                return ("0" + parseInt(c).toString(16)).slice(-2);
            }
            return '#'+convert(color['r'])+convert(color['g'])+convert(color['b']);
        },
        checkVLCVersion = function() {
            var plugins = navigator.plugins;
            for (var i = 0; i < plugins.length; i++) {
                if(plugins[i].name === "VLC Web Plugin") {
                    var version = /[0-9\.]+$/.exec(plugins[i].description);
                    if(version) {
                        return version[0];
                    }
                    break;
                }
            }
            return null;
        };

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // The Heart
    var clearClutter = function () {
        debug.log("Clearing Clutter");

        // Sidebar is so cluttered
        removeElement('li[data-name="kabam"]');
        removeElement('#nav_advertisement');
        if (bttv.settings.get("showFeaturedChannels") !== true) {
            removeElement('#nav_games');
            removeElement('#nav_streams');
            removeElement('#nav_related_streams');
        }
    }

    var channelReformat = function () {
        if ($("body[data-page=\"channel#channel\"]").length === 0) return;

        debug.log("Reformatting Channel Page");

        if (bttv.settings.get["chatWidth"] && bttv.settings.get["chatWidth"] < 0) {
            bttv.settings.save("chatWidth", 0);
        }

        $('#right_col').append("<div class='resizer' onselectstart='return false;' title='Drag to enlarge chat =D'></vid>");
        $("#right_col:before").css("margin-left", "-1");

        $(document).ready(function () {
            var resize = false,
                chatWidth;

            $("#right_col .content .bottom #controls #control_buttons .primary_button").css("float", "right");
            $("#right_nav").css({
                'margin-left': 'auto',
                'margin-right': 'auto',
                'width': '300px',
                'float': 'none',
                'border': 'none'
            });
            $('#right_col .content .top').css('border-bottom', '1px solid rgba(0, 0, 0, 0.25)')

            $("#right_close").unbind('click');

            $("#left_close").click(function () {
                $(window).trigger('resize');
            });

            $(document).keydown(function (event) {
                if (event.keyCode === 82 && event.altKey) {
                    $(window).trigger('resize');
                }
            });

            var handleResize = function () {
                debug.log("Page resized");

                var d = 0;
                if ($("#large_nav").css("display") !== "none") {
                    d += $("#large_nav").width();
                }
                if ($("#small_nav").css("display") !== "none") {
                    d += $("#small_nav").width();
                }
                if (chatWidth == 0) {
                    $("#right_col").css({
                        display: "none"
                    });
                    $("#right_close span").css({
                        "background-position": "0 0"
                    });
                }
                if ($("#right_col").css("display") !== "none") {
                    if ($("#right_col").width() < 340) {
                        chatWidth = 340;
                        $("#right_col").width(chatWidth);
                        $("#right_col .content #chat").width(chatWidth);
                        $("#right_col .content .top").width(chatWidth);
                        $("#chat_line_list").width(chatWidth);
                        $("#chat_lines").width(chatWidth);
                        $("#right_col").css("display", "inherit");
                        $("#right_close span").css({
                            "background-position": "0 -18px"
                        });
                        handleResize();
                        return;
                    } else {
                        d += $("#right_col").width();
                    }
                }

                $("#main_col").css({
                    width: $(window).width() - d + "px"
                });

                if ($(".live_site_player_container").length) {
                    var h = 0.5625 * $("#main_col").width() - 4;
                    var videoMargin = 0;
                    var calcH = $(window).height() - $("#broadcast_meta").outerHeight(true) - $("#stats_and_actions").outerHeight() + 45 - videoMargin - 10;
                    if (h > calcH) {
                        $(".live_site_player_container").css({
                            height: $(window).height() - $("#stats_and_actions").outerHeight() + 45 - videoMargin - 10 + "px"
                        });
                        $("#main_col .tse-scroll-content").animate({
                            scrollTop: $('.live_site_player_container').position().top - 10
                        }, 150, "swing");
                    } else {
                        $(".live_site_player_container").css({
                            height: h.toFixed(0) + "px"
                        });
                        $("#main_col .tse-scroll-content").animate({
                            scrollTop: 0
                        }, 150, "swing");
                    }
                } else if ($(".archive_site_player_container").length) {
                    var h = 0.5625 * $("#main_col").width() - 4;
                    var videoMargin = 0;
                    var calcH = $(window).height() - $("#broadcast_meta").outerHeight(true) - $(".archive_info").outerHeight(true) - $("#stats_and_actions").outerHeight() + 45 - videoMargin - 10;
                    if (h > calcH) {
                        $(".archive_site_player_container").css({
                            height: $(window).height() - $(".archive_info").outerHeight(true) - $("#stats_and_actions").outerHeight() + 45 - videoMargin - 10 + "px"
                        });
                        $("#main_col .tse-scroll-content").animate({
                            scrollTop: $('.archive_site_player_container').position().top - 10
                        }, 150, "swing");
                    } else {
                        $(".archive_site_player_container").css({
                            height: h.toFixed(0) + "px"
                        });
                        $("#main_col .tse-scroll-content").animate({
                            scrollTop: 0
                        }, 150, "swing");
                    }
                }

                var d = $("#broadcast_meta .info .title").width();
                $("#broadcast_meta .info .title .real_title").width() > d ? $("#broadcast_meta .info").addClass("long_title") : $("#broadcast_meta .info").removeClass("long_title");
                $("#channel_panels_contain").masonry("reload");
            }

            if (Twitch.storage.get("rightColClosed") === "true") {
                bttv.settings.save("chatWidth", 0);
                if ($("#right_col").width() == "0") {
                    $("#right_col").width("340px");
                }
                Twitch.storage.set("rightColClosed", "false");
            }

            if (bttv.settings.get("chatWidth") !== null) {
                chatWidth = bttv.settings.get("chatWidth");

                if (chatWidth == 0) {
                    $("#right_col").css({
                        display: "none"
                    });
                    $("#right_close span").css({
                        "background-position": "0 0"
                    });
                } else {
                    $("#right_col").width(chatWidth);
                    $("#right_col .content #chat").width(chatWidth);
                    $("#right_col .content .top").width(chatWidth);

                    $("#chat_line_list").width(chatWidth);
                    $("#chat_lines").width(chatWidth);
                }

                handleResize();
            } else {
                if ($("#right_col").width() == "0") {
                    $("#right_col").width("340px");

                }
                chatWidth = $("#right_col").width();
                bttv.settings.save("chatWidth", $("#right_col").width());
            }

            $(document).mouseup(function (event) {
                if (resize === false) return;
                if (chatWidthStartingPoint) {
                    if (chatWidthStartingPoint === event.pageX) {
                        if ($("#right_col").css("display") !== "none") {
                            $("#right_col").css({
                                display: "none"
                            });
                            $("#right_close span").css({
                                "background-position": "0 0"
                            });
                            chatWidth = 0;
                        }
                    } else {
                        chatWidth = $("#right_col").width();
                    }
                } else {
                    chatWidth = $("#right_col").width();
                }
                bttv.settings.save("chatWidth", chatWidth);

                resize = false;
                handleResize();
            });

            $("#right_close, #right_col .resizer").mousedown(function (event) {
                resize = event.pageX;
                chatWidthStartingPoint = event.pageX;
                $("#chat_text_input").focus();
                if ($("#right_col").css("display") === "none") {
                    $("#right_col").css({
                        display: "inherit"
                    });
                    $("#right_close span").css({
                        "background-position": "0 -18px"
                    });
                    resize = false;
                    if ($("#right_col").width() < 340) {
                        $("#right_col").width($("#right_col .content .top").width());
                    }
                    chatWidth = $("#right_col").width();
                    bttv.settings.save("chatWidth", chatWidth);
                    handleResize();
                }
            });

            $(document).mousemove(function (event) {
                if (resize) {
                    $("#chat_text_input").focus();
                    if (chatWidth + resize - event.pageX < 340) {
                        $("#right_col").width(340);
                        $("#right_col .content #chat").width(340);
                        $("#right_col .content .top").width(340);
                        $("#chat_line_list").width(340);
                        $("#chat_lines").width(340);

                        handleResize();
                    } else if (chatWidth + resize - event.pageX > 541) {
                        $("#right_col").width(541);
                        $("#right_col .content #chat").width(541);
                        $("#right_col .content .top").width(541);
                        $("#chat_line_list").width(541);
                        $("#chat_lines").width(541);

                        handleResize();
                    } else {
                        $("#right_col").width(chatWidth + resize - event.pageX);
                        $("#right_col .content #chat").width(chatWidth + resize - event.pageX);
                        $("#right_col .content .top").width(chatWidth + resize - event.pageX);
                        $("#chat_line_list").width(chatWidth + resize - event.pageX);
                        $("#chat_lines").width(chatWidth + resize - event.pageX);

                        handleResize();
                    }
                }
            });

            var resizeTimeout = null;
            $(window).off("fluid-resize").on("fluid-resize", function () {
                resizeTimeout = window.setTimeout(handleResize, 500);
            });
            $(window).resize(function () {
                $(window).trigger('fluid-resize');
            });
        });
    }

    var brand = function () {
        debug.log("Branding Site with Better & Importing Styles");

        // Old Site Header Logo Branding
        if ($("#header_logo").length) {
            $("#header_logo").html("<img alt=\"TwitchTV\" src=\"//cdn.betterttv.net/style/logos/black_twitch_logo.png\">");
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
            $("#header_logo").append(watermark);
        }

        // New Site Logo Branding
        if ($("#logo").length) {
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
            $("#logo").append(watermark);
        }

        // Adds BTTV Settings Icon to Left Sidebar
        $(".column .content #you").append('<a class="bttvSettingsIcon" href="#"></a>');
        $(".bttvSettingsIcon").click(function(e){
            e.preventDefault();
            bttv.action('openSettings');
        })

        // Import Global BTTV CSS Changes
        var globalCSSInject = document.createElement("link");
        globalCSSInject.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv.css");
        globalCSSInject.setAttribute("type", "text/css");
        globalCSSInject.setAttribute("rel", "stylesheet");
        $("body").append(globalCSSInject);

        // Import Blue Button CSS
        if (bttv.settings.get("showPurpleButtons") !== true) {
            cssBlueButtons();
        }

        // Small Popout/Embed Chat Fixes
        $("body#chat").css("overflow-y", "hidden");
        $('#chat_loading_spinner').attr('src', "data:image/gif;base64,R0lGODlhFgAWAPMGANfX1wAAADc3N1tbW6Ojo39/f2tra8fHx9nZ2RsbG+np6SwsLEtLS4eHh7q6ugAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hoiQ3JlYXRlZCB3aXRoIENoaW1wbHkuY29tIgAh+QQJCgAGACwAAAAAFgAWAAAEbNCESY29OEvBRdDgFXReGI7dZ2oop65YWypIjSgGbSOW/CGAIICnEAIOPdLPSDQiNykDUNgUPn1SZs6ZjE6D1eBVmaVurV1XGXwWp0vfYfv4XpqLaKg6HqbrZzs4OjZ1MBlYhiJkiYWMfy+GEQAh+QQJCgAGACwAAAAAFgAWAAAEctDIKYO9NKe9lwlCKAQZlQzo4IEiWUpnuorjC6fqR7tvjM4tgwJBJN5kuqACwGQef8kQadkEPHMsqbBqNfiwu231CtRSm+Ro7ez04sprbjobH7uR9Kn8Ds2L0XxgSkVGgXA8JV+HNoZqiBocCYuMJX4vEQAh+QQJCgAAACwAAAAAFgAWAAAEcxDISWu4uNLEOwhCKASSGA5AMqxD8pkkIBR0gaqsC4rxXN+s1otXqtlSQR2s+EPmhqGeEfjcRZk06kpJlE2dW+gIe8SFrWNv0yxES9dJ8TsLbi/VdDb3ii/H3WRadl0+eX93hX5ViCaCe2kaKR0ccpGWlREAIfkECQoAAQAsAAAAABYAFgAABHUwyEmrvTisxHlmQigw2mAOiWSsaxMwRVyQy4mqRE64sEzbqYBBt3vJZqVTcKjjHX9KXNPoS5qWRGe1FhVmqTHoVZrThq0377R35o7VZTDSnWbG2XMguYgX1799aFhrT4J7ZnldLC1yfkEXICKOGRcbHY+UlBEAIfkECQoAAQAsAAAAABYAFgAABHIwyEmrvThrOoQXTFYYpFEEQ6EWgkS8rxMUMHGmaxsQR3/INNhtxXL5frPaMGf0AZUooo7nTAqjzN3xecWpplvra/lt9rhjbFlbDaa9RfZZbFPHqXN3HQ5uQ/lmSHpkdzVoe1IiJSZ2OhsTHR8hj5SVFREAIfkECQoAAQAsAAAAABYAFgAABGowyEmrvTjrzWczIJg5REk4QWMShoQAMKAExGEfRLq2QQzPtVtOZeL5ZLQbTleUHIHK4c7pgwqZJWM1eSVmqTGrTdrsbYNjLAv846a9a3PYvYRr5+j6NPDCR9U8FyQmKHYdHiEih4uMjRQRACH5BAkKAAEALAAAAAAWABYAAARkMMhJq7046807d0QYSkhZKoFiIqhzvAchATSNIjWABC4sBznALbfrvX7BYa0Ii81yShrT96xFdbwmEhrALbNUINcrBR+rti7R7BRb1V9jOwkvy38rVmrV0nokICI/f4SFhocSEQAh+QQJCgABACwAAAAAFgAWAAAEWjDISau9OOvNu7dIGCqBIiKkeUoH4AIk8gJIOR/sHM+1cuev3av3C7SCAdnQ9sIZdUke0+U8uoQuYhN4jS592ydSmZ0CqlAyzYweS8FUyQlVOqXmn7x+z+9bIgA7");

        // Run Beta Chat After BTTV CSS
        betaChat();
    }

    var betaChat = function () {
        if (bttv.settings.get("bttvChat") === true && Twitch.user.isLoggedIn() && window.SitePageType !== "directory" && window.SitePageType !== "backpack" && window.SitePageType !== "profile") {

            if($("body#chat").length) return;

            debug.log("Running Beta Chat");

            $.getJSON("//chat.betterttv.net/login.php?onsite=true&user="+Twitch.user.login()+"&callback=?", function(d) {

                if(d.status === true) {
                    debug.log("Logged into BTTV Chat");
                } else {
                    debug.log("Not logged into BTTV Chat");
                }

                var chatDJSInject = document.createElement("script");
                chatDJSInject.setAttribute("src", "//chat.betterttv.net/client/external.php?type=djs");
                chatDJSInject.setAttribute("type", "text/javascript");
                $("body").append(chatDJSInject);

                setTimeout(function() {
                    var chatJSInject = document.createElement("script");
                    chatJSInject.setAttribute("src", "//chat.betterttv.net/client/external.php?type=js");
                    chatJSInject.setAttribute("type", "text/javascript");
                    $("body").append(chatJSInject);
                }, 5000);

            });

            var chatCSSInject = document.createElement("link");
            chatCSSInject.setAttribute("href", "//chat.betterttv.net/client/external.php?type=css");
            chatCSSInject.setAttribute("type", "text/css");
            chatCSSInject.setAttribute("id", "arrowchat_css");
            chatCSSInject.setAttribute("rel", "stylesheet");
            $("head").append(chatCSSInject);

            jqac = $;

            if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

            $("#emoticon-selector-toggle").unbind('click');
            $("#right_col .content #twitch_chat .bottom").css("height", parseInt($("#right_col .content #twitch_chat .bottom").height()) + 35);
            $("#right_col .content #archives").css("bottom", "30px");

            var n = parseInt($(".chat_box .js-chat-scroll").css("bottom"), 10)+35,
                j = parseInt($("#right_col .content #twitch_chat .bottom").height());
                r = 0;
            $("#emoticon-selector-toggle").on("click", function() {
                var t = $(".emoticon-selector").outerHeight(!0),
                    i = $(".chat_box .emoticon-selector-container");
                $(this).toggleClass("selected")
                i.outerHeight() > 0 ? ($(".chat_box .js-chat-scroll").animate({ bottom: n }, 200, function() { CurrentChat.scroll_chat() }), i.animate({ height: r }, 200), $("#right_col .content #twitch_chat .bottom").animate({ height: j }, 200))
                    : ($(".chat_box .js-chat-scroll").animate({ bottom: n + t }, 200, function() { CurrentChat.scroll_chat() }), i.animate({ height: t }, 200), $("#right_col .content #twitch_chat .bottom").animate({ height: parseInt($("#right_col .content #twitch_chat .bottom").height()) + t }, 200),
                        $(".js-emoticon-selector-scroll").TrackpadScrollEmulator({ wrapContent: !1, scrollbarHideStrategy: "rightAndBottom"})
                    )
            });
            
            $(".chat_box .js-chat-scroll").css("bottom", parseInt($(".chat_box .js-chat-scroll").css("bottom")) + 35);
        }
    }

    var checkMessages = function () {
        debug.log("Check for New Messages");

        if($("body#chat").length) return;

        if (Twitch.user.isLoggedIn() && window.Firebase) {
            var newMessages = function(namespaced) {
                var notificationsLoaded = false;
                var notifications = 0;
                namespaced.child("users/" + Twitch.user.userId() + "/messages").on("value", function (f) {
                    var f = f.val() || {}, j = f.unreadMessagesCount;
                    $(".js-unread_message_count").html(j || "");
                    j ? $(".js-unread_message_count").show() : $(".js-unread_message_count").hide();
                    if (notificationsLoaded === true && notifications < j) {
                        $.get('http://www.twitch.tv/inbox', function (data) {
                            var $message = $(data).find("#message-list .unread:first");
                                
                            if ($message) {
                                var $senderData = $message.children("div.from_to_user"),
                                    $messageData = $message.children("div.message_data"),
                                    url = "http://www.twitch.tv"+$messageData.children(".message_subject").attr("href"),
                                    avatar = $senderData.children(".prof").children("img").attr("src"),
                                    sender = $senderData.children(".capital").html().capitalize();
                            } else {
                                var url = "http://www.twitch.tv/inbox",
                                    avatar = "//www-cdn.jtvnw.net/images/xarth/404_user_50x50.png",
                                    sender = "Someone";
                            }
                            bttv.notify(sender+' just sent you a Message!\nClick here to view it.', 'Twitch Message Received', url, avatar, 'new_message_'+sender);
                        });
                    }
                    notifications = j;
                    notificationsLoaded = true;
                    if (notifications > 0 && document.getElementById("header_logo")) {
                        if (document.getElementById("messagescount")) {
                            document.getElementById("messagescount").innerHTML = notifications;
                        } else {
                            var messagesnum = document.createElement("a");
                            var header_following = document.getElementById("header_following");
                            messagesnum.setAttribute("id", "messagescont");
                            messagesnum.setAttribute("href", "/inbox");
                            messagesnum.setAttribute("class", "normal_button");
                            messagesnum.setAttribute("style", "margin-right: 10px;");
                            messagesnum.innerHTML = "<span id='messagescount' style='padding-left:28px;background-image:url(//cdn.betterttv.net/style/icons/messages.png);background-position: 8px 4px;padding-top:-1px;background-repeat: no-repeat;color:black;'>" + notifications + "</span>";
                            header_following.parentNode.insertBefore(messagesnum, header_following);
                        }
                    } else {
                        if (document.getElementById("messagescont")) document.getElementById("messagescont").remove();
                    }
                });
            }
            window.getFirebase().then(function(e) {
                newMessages(e.namespaced)
            });
        }

    }

    var cssBlueButtons = function () {
        debug.log("Turning Purple to Blue");

        var globalCSSInject = document.createElement("style");
        globalCSSInject.setAttribute("type", "text/css");
        globalCSSInject.setAttribute("id", "bttvBlueButtons");
        globalCSSInject.innerHTML = "#large_nav .game_filter.selected a { border-left: 4px solid #374a9b !important; } .primary_button:hover, .primary_button:focus, #subscribe_action .subscribe-text:hover, #subscribe_action .subscribe-text:focus { background: linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -o-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -moz-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -webkit-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%);background: -ms-linear-gradient(bottom, rgb(42,70,135) 31%, rgb(86,147,232) 80%); } .primary_button, #subscribe_action .subscribe-text {border-color: #000 !important;background: linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -o-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -moz-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -webkit-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);background: -ms-linear-gradient(bottom, rgb(41,59,148) 31%, rgb(54,127,235) 80%);}#team_member_list .page_links a {color: #374a9b !important;}#team_member_list .page_links a b.left {border-left-color: #374a9b !important;}#team_member_list .page_links a b.right {border-left-color: #374a9b !important;}";
        $("body").append(globalCSSInject);
    }

    var directoryLiveTab = function () {
        if(bttv.settings.get("showDirectoryLiveTab") === true && $('h2.title:contains("Channels You Follow")').length && $('a.active:contains("Overview")').length) {

            debug.log("Changing Directory View");

            $('a:contains("Live Channels")').click();

        }
    }

    var chatFunctions = function () {
        if (!document.getElementById("chat_lines")) return;

        debug.log("Modifying Chat Functionality");

        if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

        var connectToChat = function(reconnect) {
            if(bttv.socketServer && !CurrentChat.devchat && !CurrentChat.eventchat) {
                bttv.socketServer.emit("chat servers").once("chat servers", function(data) {
                    bttv.TwitchStatus = {};
                    bttv.TwitchChatServers = [];
                    bttv.TwitchChatPorts = [];
                    data.servers.forEach(function(server) {
                        if(CurrentChat.cantConnectTo6667 >= 2 && server.port === 6667) return;
                        bttv.TwitchStatus[server.ip+":"+server.port] = server.lag;
                        bttv.TwitchChatServers.push(server.ip);
                        bttv.TwitchChatPorts.push(server.port);
                    });
                    if(CurrentChat.flash_loaded) {
                        CurrentChat.disconnect();
                        if(!reconnect) {
                            removeElement(".line");
                            CurrentChat.admin_message("<center><small>BetterTTV v" + bttv.info.version + " Loaded.</small></center>");
                        }
                        CurrentChat.get_servers = function () {
                            return [bttv.TwitchChatServers[0]];
                        }
                        CurrentChat.get_ports = function () {
                            return [bttv.TwitchChatPorts[0]];
                        }
                        var a = CurrentChat.ircSystem.cloneNode(!0);
                        CurrentChat.ircSystem.parentNode.replaceChild(a, CurrentChat.ircSystem);
                        CurrentChat.ircSystem = a;
                        CurrentChat.me.is_loaded = !1;
                        CurrentChat.connect(CurrentChat.room);
                    } else {
                        CurrentChat.get_servers = function () {
                            return [bttv.TwitchChatServers[0]];
                        }
                        CurrentChat.get_ports = function () {
                            return [bttv.TwitchChatPorts[0]];
                        }
                        CurrentChat.admin_message("<center><small>BetterTTV v" + bttv.info.version + " Loaded.</small></center>");
                    }
                });
            } else {
                if(!reconnect) {
                    CurrentChat.admin_message("<center><small>BetterTTV v" + bttv.info.version + " Loaded.</small></center>");
                }
            }
            if(CurrentChat.devchat || CurrentChat.eventchat) {
                CurrentChat.admin_message("BetterTTV: You are connecting to an event chat server.");
            }
        }
        connectToChat(false);

        //CurrentChat.admin_message("<center><small>BetterTTV v" + bttv.info.version + " Loaded.</small></center>");

        CurrentChat.activePage = true;
        $(window).on("blur focus", function(e) {
            var prevType = $(this).data("prevType");

            if (prevType != e.type) {   //  reduce double fire issues
                switch (e.type) {
                    case "blur":
                        CurrentChat.activePage = false;
                        break;
                    case "focus":
                        CurrentChat.activePage = true;
                        break;
                }
            }

            $(this).data("prevType", e.type);
        })

        if (bttv.settings.get("scrollbackAmount")) {
            CurrentChat.line_buffer = bttv.settings.get("scrollbackAmount");
        }

        Chat.prototype.insert_chat_lineOld = Chat.prototype.insert_chat_line;
        Chat.prototype.insert_chat_line = function (info) {
            if (vars.currentViewers.indexOf(info.nickname) === -1 && info.nickname !== "jtv" && info.nickname !== "twitchnotify") {
                vars.currentViewers.push(info.nickname);
            }

            if (CurrentChat.currently_scrolling) {
                setTimeout(function () {
                    $("#chat_lines").scrollTop($("#chat_lines")[0].scrollHeight);
                }, 1000);
            }

            if (CurrentChat.checkMods && info.nickname === "jtv") {
                var modsRegex = /^The moderators of this room are:(.*)/,
                    mods = modsRegex.exec(info.message);
                if (mods) {
                    CurrentChat.checkingMods = false;
                    mods = mods[1].trim().split(", ");
                    mods.push(CurrentChat.channel);
                    mods.forEach(function (mod) {
                        if(!CurrentChat.moderators[mod]) {
                            var action = {
                                sender: "jtv",
                                target: mod
                            }
                            fakeCurrentChat("user_oped", action);
                            debug.log("Added "+mod+" as a mod");
                        }
                    });
                    for (mod in CurrentChat.moderators) {
                        if(CurrentChat.moderators.hasOwnProperty(mod)) {
                            if(mods.indexOf(mod) === -1) {
                               var action = {
                                    sender: "jtv",
                                    target: mod
                                }
                                fakeCurrentChat("user_deoped", action);
                                debug.log("Removed "+mod+" as a mod"); 
                            }
                        }
                    }
                    var time = new Date().getTime() / 1000;
                    CurrentChat.lastActivity = time;
                    CurrentChat.setup_chat_settings_menu();
                    CurrentChat.last_sender = "jtv";
                    return;
                }
            } else if(info.nickname === "jtv") {
                var modsRegex = /^The moderators of this room are:/,
                    mods = info.message.match(modsRegex);
                if (mods) {
                    CurrentChat.checkMods = true;
                }
            }

            var time = new Date().getTime() / 1000;
            CurrentChat.lastActivity = time;

            if (info.tagtype == "broadcaster") {
                info.tagname = "Host";
            }

            if (CurrentChat.trackTimeouts && CurrentChat.trackTimeouts[info.nickname]) {
                delete CurrentChat.trackTimeouts[info.nickname];
            }

            var x = 0;
            if (info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin") x = 1;

            var messageHighlighted = false,
                highlightKeywords = [],
                blacklistKeywords = [];

            if (bttv.settings.get("blacklistKeywords")) {
                var keywords = bttv.settings.get("blacklistKeywords");
                var phraseRegex = /\{.+?\}/g;
                var testCases =  keywords.match(phraseRegex);
                if(testCases) {
                    for (i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        blacklistKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
                    }
                }
                if(keywords !== "") {
                    keywords = keywords.split(" ");
                    keywords.forEach(function (keyword) {
                        blacklistKeywords.push(keyword);
                    });
                }
            }

            if (bttv.settings.get("highlightKeywords")) {
                var extraKeywords = bttv.settings.get("highlightKeywords");
                var phraseRegex = /\{.+?\}/g;
                var testCases =  extraKeywords.match(phraseRegex);
                if(testCases) {
                    for (i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        extraKeywords = extraKeywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        highlightKeywords.push(testCase.replace(/(^\{|\}$)/g, '').trim());
                    }
                }
                if(extraKeywords !== "") {
                    extraKeywords = extraKeywords.split(" ");
                    extraKeywords.forEach(function (keyword) {
                        highlightKeywords.push(keyword);
                    });
                }
            }

            if (Twitch.user.login() && bttv.settings.get("selfHighlights") !== false) {
                highlightKeywords.push(Twitch.user.login());
            }

            var filtered = false;
            blacklistKeywords.forEach(function (keyword) {
                keyword = escapeRegExp(keyword).replace(/\*/g, "[^ ]*");
                var blacklistRegex = new RegExp(keyword, 'i');
                if (blacklistRegex.test(info.message) && Twitch.user.login() !== info.nickname) {
                    info.message = "&lt;message filtered&gt;";
                    filtered = true;
                }
            });
            if(bttv.settings.get("hideDeletedMessages") === true && filtered) return;

            highlightKeywords.forEach(function (keyword) {
                keyword = escapeRegExp(keyword).replace(/\*/g, "[^ ]*");
                var wordRegex = new RegExp('(\\b|\\s|^)' + keyword + '(\\b|\\s|$)', 'i');
                var nickRegex = new RegExp('^' + keyword + '$', 'i');
                if (Twitch.user.login() !== "" && (((wordRegex.test(info.message) || nickRegex.test(info.nickname)) && Twitch.user.login() !== info.nickname) || (Twitch.user.login() === info.nickname && bttv.settings.get("highlightKeywords") && bttv.settings.get("highlightKeywords").indexOf(Twitch.user.login()) !== -1))) {
                    messageHighlighted = true;
                    if(bttv.settings.get("desktopNotifications") === true && CurrentChat.activePage === false) {
                        bttv.notify("You were mentioned in "+CurrentChat.lookupDisplayName(CurrentChat.channel)+"'s channel.");
                    }
                }
            });

            if(info.color === "black") info.color = "#000000";
            if(info.color === "MidnightBlue") info.color = "#191971";
            if(info.color === "DarkRed") info.color = "#8B0000";

            var colorRegex = /^#[0-9a-f]+$/i;
            if(colorRegex.test(info.color)) {
                while (((calculateColorBackground(info.color) === "light" && bttv.settings.get("darkenedMode") === true) || (calculateColorBackground(info.color) === "dark" && bttv.settings.get("darkenedMode") !== true)) && Twitch.user.login() !== info.nickname) {
                    info.color = calculateColorReplacement(info.color, calculateColorBackground(info.color));
                }
            }

            if (bttv.glow && bttv.glow[info.nickname] && !info.is_action) {
                var rgbColor = getRgb(info.color);
                if(bttv.settings.get("darkenedMode") === true) info.color = info.color+"; text-shadow: 0 0 20px rgba("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+",0.8)";
            }

            if (vars.blackChat && info.color === "#000000") {
                info.color = "#ffffff";
            }

            if (messageHighlighted === true && bttv.settings.get("darkenedMode") === true) {
                info.color = "#ffffff";
                ich.templates["chat-line"] = ich.templates["chat-line-highlight"];
                ich.templates["chat-line-action"] = ich.templates["chat-line-action-highlight"];
            } else if (messageHighlighted === true && Twitch.user.login() !== "") {
                info.color = "#000000";
                ich.templates["chat-line"] = ich.templates["chat-line-highlight"];
                ich.templates["chat-line-action"] = ich.templates["chat-line-action-highlight"];
            } else {
                ich.templates["chat-line"] = ich.templates["chat-line-old"];
                ich.templates["chat-line-action"] = ich.templates["chat-line-action-old"];
            }

            //Bots
            var bots = ["nightbot","moobot","sourbot","xanbot","manabot","mtgbot","ackbot","baconrobot","tardisbot","deejbot"];
            if(bots.indexOf(info.sender) !== -1 && x==1) { info.tagtype="bot"; info.tagname = "Bot"; }

            if (bttv.settings.get("showDefaultTags") !== true) {
                if (info.tagtype == "mod" || info.tagtype == "broadcaster" || info.tagtype == "admin" || info.tagtype == "staff" || info.tagtype === "bot") info.tagtype = "old" + info.tagtype;
            }

            if(info.nickname === info.sender) {
                info.nickname = CurrentChat.lookupDisplayName(info.sender);
            } else {
                CurrentChat.lookupDisplayName(info.sender);
            }
            
            //this.insert_chat_lineOld(info);
            if (info.message.substr(0, 3).trim() === "/me") {
                info.message = info.message.substr(4);
            }

            if (!(CurrentChat.restarting && !CurrentChat.history_ended || CurrentChat.ignored[info.sender]))
                if ("jtv" === info.sender) CurrentChat.last_sender = info.sender, CurrentChat.admin_message(CurrentChat.format_message(info));
                else if ("twitchnotify" === info.sender) CurrentChat.last_sender = info.sender, CurrentChat.notify_message("subscriber", CurrentChat.format_message(info));
                else if (!info.is_action && !messageHighlighted && CurrentChat.last_sender && CurrentChat.last_sender === info.sender && "jtv" !== CurrentChat.last_sender) CurrentChat.insert_with_lock("#chat_line_list li:last", '<p class="chat_line" style="display:block;" data-raw="'+encodeURIComponent(info.message.replace(/%/g,""))+'">&raquo; ' + CurrentChat.format_message(info) + "</p>");
            else {
                $("#chat_loading_spinner")[0].style.display = "none";
                CurrentChat.last_sender = info.sender;
                var d = !! (Twitch.user.login() === CurrentChat.channel || CurrentChat.userData && (CurrentChat.userData.is_staff || CurrentChat.userData.is_admin) || CurrentChat.staff[Twitch.user.login()] || CurrentChat.admins[Twitch.user.login()] || CurrentChat.moderators[Twitch.user.login()]),
                    c = info.is_action ? "chat-line-action" : "chat-line",
                    b = !1,
                    f = unescape(info.nickname);
                0 === f.indexOf("ign-") && (b = !0, f = f.substr(4));
                if (CurrentChat.moderators[info.sender]) {
                    if (CurrentChat.channel === Twitch.user.login()) {
                        var showThem = true;
                    } else {
                        var showThem = false;
                    }
                } else {
                    var showThem = true
                }
                if(bttv.settings.get("showModIcons") == null) bttv.settings.save("showModIcons", true);
                if(bttv.settings.get("showTimestamps") == null) bttv.settings.save("showTimestamps", true);
                var h = "chat-line-" + Math.round(1E9 * Math.random()),
                    f = {
                        id: h,
                        showModButtons: d && "jtv" !== info.sender && info.sender !== Twitch.user.login() && bttv.settings.get("showModIcons") && showThem,
                        timestamp: bttv.settings.get("showTimestamps") || !CurrentChat.history_ended ? info.timestamp : "",
                        sender: info.sender,
                        displayname: f,
                        color: info.color
                    }, g = d = "";
                info.tagtype && (d = '<span class="tag %tagtype">%tagname</span>&nbsp;'.replace(/\%tagtype/g,
                    info.tagtype).replace(/\%tagname/g, info.tagname));
                info.turbo && (d += '<span class="tag %tagtype" title="%tagname"><a href="/products/turbo?ref=chat_badge" target="_blank">%tagname</a></span> '.replace(/\%tagtype/g, "turbo").replace(/\%tagname/g, "Turbo"));
                info.subscriber && (g = '<span class="tag %tagtype c%tagchannel" title="%tagname">' + ('<a href="/' + CurrentChat.channel + '/subscribe" target="_blank">%tagname</a>'), d += (g + "</span> ").replace(/\%tagtype/g, "subscriber").replace(/\%tagname/g, "Subscriber").replace(/\%tagchannel/g, CurrentChat.channel));
                b && (d += '<span class="tag %tagtype" title="%tagname">%tagname</span>&nbsp;'.replace(/\%tagtype/g, "ign").replace(/\%tagname/g, "My IGN"));
                c = ich[c](f)[0].outerHTML;
                c = c.replace(/\@raw/g, encodeURIComponent(info.message.replace(/%/g,"")));
                c = c.replace(/\@tag/g, d);
                c = c.replace(/\@message/g, CurrentChat.format_message(info));
                "jtv" !== info.sender ? CurrentChat.insert_with_lock("#chat_line_list", c, info, h) : CurrentChat.insert_with_lock("#chat_line_list", c);
                setTimeout(function () {
                    $("#" + h).click(function () {
                        setTimeout(function () {
                            $("#chat_viewers_dropmenu").css("display", "none");
                        }, 100);
                    });
                }, 500);
            }
        }

        ich.templates["chat-line-action"] = '<li class="chat_from_{{sender}} line" data-sender="{{sender}}"><p><span class="small">{{timestamp}}&nbsp;</span>{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}@tag<a class="nick" href="/{{sender}}" id="{{id}}" style="color:{{color}};">{{displayname}}</a> <span class="chat_line" style="color:{{color}};" data-raw="@raw">@message</span></p></li>';
        ich.templates["chat-line-action-highlight"] = '<li class="chat_from_{{sender}} line highlight" data-sender="{{sender}}"><p><span class="small">{{timestamp}}&nbsp;</span>{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}@tag<a class="nick" href="/{{sender}}" id="{{id}}" style="color:{{color}};">{{displayname}}</a> <span class="chat_line" style="color:{{color}};" data-raw="@raw">@message</span></p></li>';
        ich.templates["chat-line"] = '<li class="chat_from_{{sender}} line" data-sender="{{sender}}"><p><span class="small">{{timestamp}}&nbsp;</span>{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}@tag<a class="nick" href="/{{sender}}" id="{{id}}" style="color:{{color}};">{{displayname}}</a>:&nbsp;<span class="chat_line" data-raw="@raw">@message</span></p></li>';
        ich.templates["chat-line-highlight"] = '<li class="chat_from_{{sender}} line highlight" data-sender="{{sender}}"><p><span class="small">{{timestamp}}&nbsp;</span>{{#showModButtons}}{{> chat-mod-buttons}}{{/showModButtons}}@tag<a class="nick" href="/{{sender}}" id="{{id}}" style="color:{{color}};">{{displayname}}</a>:&nbsp;<span class="chat_line" data-raw="@raw">@message</span></p></li>';
        ich.templates["chat-line-old"] = ich.templates["chat-line"];
        ich.templates["chat-line-action-old"] = ich.templates["chat-line-action"];

        var purge = '<span><a href="#" class="normal_button tooltip chat_menu_btn bttvTimeout" data-time="1" title="Purges Users Chat - 1 Second Timeout"><span class="glyph_only"><img src="//cdn.betterttv.net/style/icons/purge.png" /></span></a>&nbsp;</span>';
        $(purge).insertBefore("#chat_menu_timeout");
        var permit = '<span><a href="#" class="normal_button tooltip chat_menu_btn bttvPermit" title="!permit a user to post a link - Functions with bots like Moobot or Nightbot"><span class="glyph_only"><img src="//cdn.betterttv.net/style/icons/permit.png" /></span></a>&nbsp;</span>';
        $(permit).insertBefore(".bttvTimeout");
        var tempBan = '<span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn bttvTimeout" data-time="28800" title="Temporary 8 hour ban"><span class="glyph_only"><img src="//cdn.betterttv.net/style/icons/8hr.png" /></span></a></span><span>&nbsp;<a href="#" class="normal_button tooltip chat_menu_btn bttvTimeout" data-time="86400" title="Temporary 24 hour ban"><span class="glyph_only"><img src="//cdn.betterttv.net/style/icons/24hr.png" /></span></a></span>';
        $(tempBan).insertAfter("#chat_menu_timeout");
        $("#chat_menu_tools").insertAfter("#chat_menu_op_tools");

        $(".bttvTimeout").each(function() {
            $(this).click(function() {
                var time = $(this).data("time"),
                    user = $("#user_info .nick").html().toLowerCase();
                ga('send', 'event', 'Chat', 'Send Timeout: ' + time);
                CurrentChat.say("/timeout " + user + " " + time);
            });
        });

        $(".bttvPermit").click(function () {
            var user = $("#user_info .nick").html().toLowerCase();
            ga('send', 'event', 'Chat', 'Send Permit');
            CurrentChat.say("!permit " + user);
        });

        CurrentChat.TMIFailedToJoin = true;
        CurrentChat.TMIFailedToJoinTries = 1;
        CurrentChat.checkModsViaCommand = true;

        CurrentChat.linkify_re = /(\b\x02?((?:https?:\/\/|[\w\-\.\+]+@)?\x02?(?:[\w\-]+\x02?\.)+\x02?(?:com|au|org|tv|net|info|jp|uk|us|cn|fr|mobi|gov|co|ly|me|vg|eu|ca|fm|am|ws)\x02?(?:\:\d+)?\x02?(?:\/[\w\.\/@\?\&\%\#\(\)\,\-\+\=\;\:\x02?]+\x02?[\w\/@\?\&\%\#\(\)\=\;\x02?]|\x02?\w\x02?|\x02?)?\x02?)\x02?\b|(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9]+-?)*[a-z0-9]+)(?:\.(?:[a-z0-9]+-?)*[a-z0-9]+)*(?:\.(?:[a-z]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?)/gi

        if (bttv.settings.get("dblclickTranslation") !== false) {
            $(document).on('dblclick', '.chat_line', function() {
                CurrentChat.translate(this, $(this).closest("li").data("sender"), $(this).data("raw"));
                $(this).html("Translating..");
            });
        }

        CurrentChat.translate = function(element, sender, text) {
            var language = window.location.host.split('.')[0].replace(/^(www|beta)$/,"en"),
                query = 'http://translate.google.com/translate_a/t?client=bttv&sl=auto&tl='+language+'&ie=UTF-8&oe=UTF-8&q='+text,
                translate = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D\""+encodeURIComponent(query)+"\"&format=json&diagnostics=false&callback=?";

            $.ajax({
                url: translate,
                cache: !1,
                timeoutLength: 6E3,
                dataType: 'json',
                success: function (data) {
                    if(data.error) {
                        $(element).html("Translation Error");
                    } else {
                        var sentences = data.query.results.json.sentences;
                        if(sentences instanceof Array) {
                            var translation = "";
                            sentences.forEach(function(sentence) {
                                translation += sentence.trans;
                            });
                        } else {
                            var translation = sentences.trans;
                        }
                        $(element).html(CurrentChat.format_message.call(CurrentChat, { sender: sender, message: translation }));
                        CurrentChat.scroll_chat();
                    }
                },
                error: function() {
                    $(element).html("Translation Error: Server Error");
                }
            });
        }

        CurrentChat.notify_message = function (type, message) {
            if (type === "subscriber") {
                var subIcon = '<span class="tag subscriber c'+CurrentChat.channel+'" title="Subscriber"><a href="/'+CurrentChat.channel+'/subscribe" target="_blank">Subscriber</a></span>&nbsp;&nbsp;';
                var msg = '<li class="line"><p>'+subIcon+'<span class="chat_line fromtwitchnotify" data-raw="'+encodeURIComponent(message.replace(/%/g,""))+'">' + message + "</span></p></li>";
            } else {
                var icon = '<span class="tag '+type+'">'+type.capitalize()+'</span>&nbsp;&nbsp;';
                var msg = '<li class="line"><p>'+icon+'<span class="chat_line fromtwitchnotify" data-raw="'+encodeURIComponent(message.replace(/%/g,""))+'">' + message + "</span></p></li>";
            }
            this.last_sender = "twitchnotify", this.insert_with_lock("#chat_line_list", msg)
        }

        CurrentChat.chat_say_old = CurrentChat.chat_say;
        CurrentChat.chat_say = function (message) {
            var n = message || $("#chat_text_input")[0],
            r = n.value;
            if(bttv.settings.get("antiPrefix") === true && CurrentChat.autoCompleteEmotes) {
                var existingEmotes = [];
                CurrentChat.emoticons.forEach(function(emote) {
                    existingEmotes.push(""+emote.regex);
                });
                for(var emote in CurrentChat.autoCompleteEmotes) {
                    if(CurrentChat.autoCompleteEmotes.hasOwnProperty(emote) && existingEmotes.indexOf("/\\b"+emote+"\\b/g") === -1) {
                        var emoteRegex = new RegExp("\\b"+emote+"\\b","g");
                        r = r.replace(emoteRegex, CurrentChat.autoCompleteEmotes[emote]);
                    }
                }
            }
            $("#chat_text_input").val(r);
            if(!CurrentChat.sentHistory) CurrentChat.sentHistory = [];
            if(CurrentChat.sentHistory.indexOf(r) !== -1) {
                CurrentChat.sentHistory.splice(CurrentChat.sentHistory.indexOf(r), 1);
            }
            if(r.trim() === "/mods" || r.trim() === ".mods") CurrentChat.checkMods = false;
            if(r.trim() === "/massunban" || r.trim() === ".massunban") {
                CurrentChat.massUnban();
                $("#chat_text_input").val("");
                return;
            }
            if(bttv.socketServer && (r.trim() === "/invite friends" || r.trim() === ".invite friends")) {
                bttv.socketServer.emit("invite friends", { channel: CurrentChat.channel, token: CurrentChat.userData.chat_oauth_token });
                $("#chat_text_input").val("");
                return;
            }
            CurrentChat.sentHistory.unshift(r);
            CurrentChat.chat_say_old.call(CurrentChat, message);
        }

        CurrentChat.say_old = CurrentChat.say;
        CurrentChat.linesInPast30s = 0;
        CurrentChat.say = function(e, t) {
            debug.log("Attempting to send chat: "+e);
            if(CurrentChat.linesInPast30s >= 19) {
                CurrentChat.admin_message("BetterTTV: To prevent a Twitch global chat ban, outgoing commands/messages are blocked for "+(31-(Math.round(new Date().getTime()/1000)-CurrentChat.linesInPast30sTime))+" more seconds.");
                return;
            } else if(CurrentChat.linesInPast30s === 0) {
                CurrentChat.linesInPast30sTime = Math.round(new Date().getTime()/1000);
                setTimeout(function(){ CurrentChat.linesInPast30s = 0; }, 31000);
            }
            if(Twitch.user.login() && Twitch.user.login() in CurrentChat.moderators) {
                debug.log("Sending chat: "+e);
                CurrentChat.say_old.call(CurrentChat, e, t);
                CurrentChat.linesInPast30s++;
            } else {
                var currentTime = new Date().getTime();
                if(CurrentChat.lastSpokenTime && currentTime-CurrentChat.lastSpokenTime < 2100) {
                    var spamDifference = 2100-(currentTime-CurrentChat.lastSpokenTime);
                    setTimeout(function() {
                        debug.log("Sending chat: "+e);
                        CurrentChat.say_old.call(CurrentChat, e, t);
                    }, spamDifference);
                    CurrentChat.lastSpokenTime = currentTime+spamDifference;
                } else {
                    debug.log("Sending chat: "+e);
                    CurrentChat.say_old.call(CurrentChat, e, t);
                    CurrentChat.lastSpokenTime = currentTime;
                }
            }
        }

        var unbannedUsers = [];
        CurrentChat.massUnban = function() {
            if(Twitch.user.login() && Twitch.user.login() == CurrentChat.channel) {
                var bannedUsers = [];
                CurrentChat.admin_message("Fetching banned users...");
                $.ajax({url: "/settings/chat", cache: !1, timeoutLength: 6E3, dataType: 'html'}).done(function (chatInfo) {
                    if(chatInfo) {
                        $(chatInfo).find("#banned_chatter_list .ban .obj").each(function() {
                            var user = $(this).html().trim();
                            if(unbannedUsers.indexOf(user) === -1 && bannedUsers.indexOf(user) === -1) bannedUsers.push(user);
                        });
                        if(bannedUsers.length > 0) {
                            CurrentChat.admin_message("Fetched "+bannedUsers.length+" banned users.");
                            if(bannedUsers.length > 10) {
                                CurrentChat.admin_message("Starting purge process in 5 seconds. Get ready for a spam fest!");
                            } else {
                                CurrentChat.admin_message("Starting purge process in 5 seconds.");
                            }
                            CurrentChat.admin_message("By my calculations, this block of users will take "+((bannedUsers.length*2.1)/60).toFixed(2)+" minutes to unban.");
                            if(bannedUsers.length > 70) CurrentChat.admin_message("Twitch only provides up to 80 users at a time, but this script will cycle through all of the blocks of users.");
                            setTimeout(function() {
                                if(Twitch.user.login() in CurrentChat.moderators) delete CurrentChat.moderators[Twitch.user.login()];
                                bannedUsers.forEach(function(user) {
                                    CurrentChat.say("/unban "+user);
                                    unbannedUsers.push(user);
                                });
                                CurrentChat.moderators[Twitch.user.login()] = true;
                                var currentTime = new Date().getTime(),
                                    spamDifference = 2100-(currentTime-CurrentChat.lastSpokenTime);
                                setTimeout(function() {
                                    CurrentChat.admin_message("This block of users has been purged. Checking for more..");
                                    CurrentChat.massUnban();
                                }, spamDifference);
                            }, 5000);
                        } else {
                            CurrentChat.admin_message("You have no banned users.");
                            unbannedUsers = [];
                        }
                    }
                });
            } else {
                CurrentChat.admin_message("You're not the channel owner.");
            }
        }

        CurrentChat.lookupDisplayName = function (user) {
            if(user === null || user === "") return;
            if(!CurrentChat.displayNames) CurrentChat.displayNames = {};
            if(!CurrentChat.lookingUpUsers) CurrentChat.lookingUpUsers = 0;
            if(CurrentChat.displayNames[user]) {
                if(bttv.socketServer) bttv.socketServer.emit('lookup', { user: user });
                return CurrentChat.displayNames[user];
            } else if(user !== "jtv" && user !== "twitchnotify") {
                if(bttv.socketServer) {
                    bttv.socketServer.emit('lookup', { user: user });
                } else {
                    if(CurrentChat.lookingUpUsers < 2) {
                        CurrentChat.lookingUpUsers++;
                        ga('send', 'event', 'Chat', 'Lookup Display Name');
                        Twitch.api.get("users/" + user).done(function (d) {
                            if(d.display_name && d.name) {
                                CurrentChat.displayNames[d.name] = d.display_name;
                                $('#chat_line_list .chat_from_' + d.name.replace(/%/g, '_').replace(/[<>,]/g, '') + ' .nick').each(function () {
                                    $(this).html(d.display_name);
                                });                            
                            }
                            CurrentChat.lookingUpUsers--;
                        });
                    }
                }
                return user.capitalize();
            } else {
                return user;
            }
        }
        CurrentChat.lookupDisplayName(Twitch.user.login());
        CurrentChat.lookupDisplayName(CurrentChat.channel);

        CurrentChat.handlers.user_names_end = function () {
            clearTimeout(CurrentChat.checkJoinFail);
            CurrentChat.TMIFailedToJoin = false;
            CurrentChat.retries = 10;
            CurrentChat.admin_message(i18n("Welcome to " + CurrentChat.lookupDisplayName(CurrentChat.channel) + "'s chat room!"));
            $("#chat_loading_spinner")[0].style.display = "none";
            CurrentChat.specialUserAlert = false;
            setTimeout(function(){ CurrentChat.specialUserAlert = true }, 20000);
            if(CurrentChat.checkModsViaCommand === true) {
                if(Twitch.user.login()) {
                    CurrentChat.checkingMods = true;
                    CurrentChat.checkMods = true;
                    CurrentChat.last_sender = Twitch.user.login();
                    CurrentChat.say("/mods");
                }
            }
            if(CurrentChat.get_ports()[0] === 6667) {
                CurrentChat.cantConnectTo6667 = 0;
            }
        }

        
        CurrentChat.handlers.history_end_old = CurrentChat.handlers.history_end;
        CurrentChat.handlers.history_end = function (t) {
            if(!vars.emotesLoaded) {
                overrideEmotes();
                vars.emotesLoaded = true;
            }
            CurrentChat.handlers.history_end_old.call(CurrentChat, t);
        }

        CurrentChat.handlers.emote_sets = function (d) {
            var emoteSets = JSON.parse(d.sets),
                user = d.user;

            if(!CurrentChat.user_to_emote_sets[user]) CurrentChat.user_to_emote_sets[user] = [];
            emoteSets.forEach(function (set) {
                if(CurrentChat.user_to_emote_sets[user].indexOf(set) === -1) {
                    CurrentChat.user_to_emote_sets[user].push(set);
                }
            });
        }

        CurrentChat.handlers.error = function () {
            CurrentChat.admin_message(i18n("BetterTTV: Chat encountered an error.."));
            CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
            CurrentChat.reconnect();
        }

        CurrentChat.handlers.debug = function (a) {
            CurrentChat.debug && CurrentChat.admin_message("DEBUG: " + a.message);
            if (a.message.match(/^Connecting to (.*):(80|443|6667)$/)) {
                CurrentChat.currentServer = /^Connecting to ((.*):(80|443|6667))$/.exec(a.message)[1];
                if(bttv.TwitchStatus && CurrentChat.currentServer && CurrentChat.currentServer in bttv.TwitchStatus && bttv.TwitchStatus[CurrentChat.currentServer] <= 1000) {
                    var lag = " (Lag: "+bttv.TwitchStatus[CurrentChat.currentServer]+"ms)";
                    CurrentChat.admin_message(i18n("BetterTTV: Connecting to "+CurrentChat.currentServer+lag));
                } else if(bttv.TwitchStatus && CurrentChat.currentServer && !CurrentChat.devchat && !CurrentChat.eventchat && ((bttv.TwitchChatServers.length > 0 && bttv.TwitchStatus[bttv.TwitchChatServers[0]] < bttv.TwitchStatus[CurrentChat.currentServer]) || (bttv.TwitchChatServers.length > 0 && !bttv.TwitchStatus[CurrentChat.currentServer]))) {
                    CurrentChat.admin_message(i18n("BetterTTV: You were going to connect to "+CurrentChat.currentServer+", but I noticed it is lagging. Finding another server.."));
                    connectToChat(true);
                } else {
                    CurrentChat.admin_message(i18n("BetterTTV: Connecting to "+CurrentChat.currentServer));
                }
                if(CurrentChat.currentServer) debug.log("Chat connecting to "+CurrentChat.currentServer);
            }
            if (a.message.match(/^connected$/)) {
                CurrentChat.admin_message(i18n("Connected to the chat server."));
            }
            if (a.message === "Received irc message IRCMessage from 'null' to 'null', with command 'PING' and message 'null'") {
                var time = new Date().getTime() / 1000;
                CurrentChat.lastActivity = time;
                CurrentChat.monitorActivity = true;
            }
            if (bttv.settings.get("adminStaffAlert") === true) {
                var isUserAdminOrStaff = /Received irc message IRCMessage from 'jtv' to '[a-z0-9_]+', with command 'PRIVMSG' and message 'SPECIALUSER ([a-z0-9_]+) (admin|staff)'/.exec(a.message);
                if (isUserAdminOrStaff) {
                    if(CurrentChat.specialUserAlert) {
                        var user = CurrentChat.lookupDisplayName(isUserAdminOrStaff[1]),
                            type = isUserAdminOrStaff[2],
                            msg = user+" just joined! Watch out foo!";
                        if (bttv.settings.get("showDefaultTags") !== true) type = "old"+type;
                        CurrentChat.last_sender = "twitchnotify";
                        CurrentChat.notify_message(type, msg);
                    }
                }
            }
            if (a.message.match(/^Connection lost/)) {
                if (CurrentChat.silence && CurrentChat.silence === true) {
                    CurrentChat.silence = false;
                    return;
                }
                if(CurrentChat.get_ports()[0] === 6667) {
                    if(!CurrentChat.cantConnectTo6667) CurrentChat.cantConnectTo6667 = 0;
                    CurrentChat.cantConnectTo6667++;
                    if(CurrentChat.cantConnectTo6667 === 2) {
                        connectToChat(true);
                    }
                }
                if (CurrentChat.last_sender === Twitch.user.login()) {
                    if (CurrentChat.checkingMods === true) {
                        CurrentChat.checkModsViaCommand = false;
                        CurrentChat.checkingMods = false;
                        CurrentChat.admin_message(i18n("BetterTTV: You may possibly be global banned from chat."));
                    }
                    if (CurrentChat.globalBanAttempt && CurrentChat.globalBanAttempt >= 1) {
                        CurrentChat.admin_message(i18n("BetterTTV: You were disconnected from chat."));
                        CurrentChat.admin_message(i18n("BetterTTV: You may be globally banned from chat for 8 hours (if you sent 20 lines in 30 seconds)."));
                        CurrentChat.admin_message(i18n("BetterTTV: If this is true you can still see chat, but talking will disconnect you."));
                        CurrentChat.admin_message(i18n("BetterTTV: Reconnecting anyways.."));
                        CurrentChat.TMIFailedToJoin = true;
                        CurrentChat.TMIFailedToJoinTries = 1;
                    } else {
                        CurrentChat.admin_message(i18n("BetterTTV: You were disconnected from chat."));
                        CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
                        CurrentChat.TMIFailedToJoin = true;
                        CurrentChat.TMIFailedToJoinTries = 1;
                        if (!CurrentChat.globalBanAttempt) CurrentChat.globalBanAttempt = 0;
                        CurrentChat.globalBanAttempt++;
                    }
                } else {
                    CurrentChat.admin_message(i18n("BetterTTV: You were disconnected from chat."));
                    CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
                    CurrentChat.TMIFailedToJoin = true;
                    CurrentChat.TMIFailedToJoinTries = 1;
                    $.getJSON("http://twitchstatus.com/api/report?type=chat&kind=disconnect&server=" + /^Connection lost to \(((.*):(80|443|6667))\)/.exec(a.message)[1]);
                }
            }
        }

        setInterval(function () {
            if (CurrentChat.monitorActivity) {
                var time = new Date().getTime() / 1000,
                    timeDifference = time - CurrentChat.lastActivity;
                if (timeDifference >= 360) {
                    CurrentChat.monitorActivity = false;
                    CurrentChat.admin_message(i18n("BetterTTV: I suspect your chat froze.."));
                    CurrentChat.admin_message(i18n("BetterTTV: Reconnecting.."));
                    CurrentChat.TMIFailedToJoin = true;
                    CurrentChat.TMIFailedToJoinTries = 1;
                    CurrentChat.reconnect();
                }
            }
        }, 5000)

        CurrentChat.rejoinChat = function () {

            if (!CurrentChat.currentServer) {
                var a = CurrentChat.ircSystem.cloneNode(!0);
                CurrentChat.ircSystem.parentNode.replaceChild(a, CurrentChat.ircSystem);
                CurrentChat.ircSystem = a;
                CurrentChat.me.is_loaded = !1;
                CurrentChat.connect(CurrentChat.room)
                CurrentChat.silence = true;
                CurrentChat.admin_message(i18n("BetterTTV: Trying a different server"));
            }
            if (CurrentChat.TMIFailedToJoinTries <= 10) {
                CurrentChat.admin_message(i18n("BetterTTV: Attempting to join again.. [" + CurrentChat.TMIFailedToJoinTries + "/10]"));
                CurrentChat.ircSystem.join("#" + CurrentChat.channel);
                CurrentChat.checkJoinFail = setTimeout(function () {
                    if (CurrentChat.TMIFailedToJoin === true) {
                        CurrentChat.admin_message(i18n("BetterTTV: Unable to join the chat room.."));
                        CurrentChat.rejoinChat();
                    }
                }, 10000);
                CurrentChat.TMIFailedToJoinTries++;
                $.getJSON("http://twitchstatus.com/api/report?type=chat&kind=join&server=" + CurrentChat.currentServer);
            } else {
                CurrentChat.admin_message(i18n("BetterTTV: Looks like chat is broken.. I give up. :("));
            }

        }

        CurrentChat.handlers.connected = function () {
            CurrentChat.checkJoinFail = setTimeout(function () {
                if (CurrentChat.TMIFailedToJoin === true) {
                    CurrentChat.admin_message(i18n("BetterTTV: Unable to join the chat room.."));
                    CurrentChat.rejoinChat();
                }
            }, 10000);

            CurrentChat.admin_message(i18n("Joining the chat room.."));
            CurrentChat.join_on_connect && CurrentChat.join(CurrentChat.join_on_connect);
            CurrentChat.join_on_connect = null;
            $("chat_line_list").innerHTML = "";
            CurrentChat.line_count = 0;
            $("chat_text_input").disabled = !1;
            CurrentChat.debug && CurrentChat.ircSystem.debugOn();
        }

        CurrentChat.handlers.clear_chat = function (info) {
            if (!CurrentChat.trackTimeouts) CurrentChat.trackTimeouts = {};
            var nickname = CurrentChat.real_username(info.user);
            if (info.target === "all") {
                CurrentChat.last_sender = "jtv";
                CurrentChat.insert_with_lock("#chat_line_list", '<li class="line fromjtv"><p class="content">Chat was cleared by a moderator (Prevented by BetterTTV)</p></li>');
            } else if (info.target === "user") {
                if ($('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '')).length === 0) return; 
                var nickname = CurrentChat.real_username(info.user);
                if (bttv.settings.get("hideDeletedMessages") === true) {
                    $('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '')).each(function () {
                        $(this).hide();
                    });
                    setTimeout(function() {
                        $('#chat_line_list .bot').each(function () {
                            $(this).parent().parent().find("span.chat_line:contains('"+info.user.replace(/%/g, '_').replace(/[<>,]/g, '')+"')").each(function () {
                                $(this).parent().parent().hide();
                            });
                            $(this).parent().parent().find("p.chat_line:contains('"+info.user.replace(/%/g, '_').replace(/[<>,]/g, '')+"')").each(function () {
                                $(this).parent().hide();
                            });
                        });
                    }, 3000);
                } else {
                    if (bttv.settings.get("showDeletedMessages") !== true) {
                        $('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + ' .chat_line').each(function () {
                            $(this).html("<span style=\"color: #999\">&lt;message deleted&gt;</span>");
                        });
                    } else {
                        $('#chat_line_list .chat_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + ' .chat_line').each(function () {
                            $("a", this).each(function () {
                                var rawLink = "<span style=\"text-decoration: line-through;\">" + $(this).attr("href").replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</span>";
                                $(this).replaceWith(rawLink);
                            });
                            $(".emoticon", this).each(function () {
                                $(this).css("opacity","0.1");
                            });
                            $(this).html("<span style=\"color: #999\">" + $(this).html() + "</span>");
                        });
                    }
                    if(CurrentChat.trackTimeouts[nickname]) {
                        CurrentChat.trackTimeouts[nickname].count++;
                        $('#times_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + CurrentChat.trackTimeouts[nickname].timesID).each(function () {
                            $(this).html("(" + CurrentChat.trackTimeouts[nickname].count + " times)");
                        });
                    } else {
                        CurrentChat.trackTimeouts[nickname] = {
                            count: 1,
                            timesID: Math.floor(Math.random()*100001)
                        }
                        var displayName = CurrentChat.lookupDisplayName(nickname);
                        CurrentChat.last_sender = "jtv";
                        CurrentChat.insert_with_lock("#chat_line_list", '<li class="line fromjtv"><p class="content">' + displayName + ' has been timed out. <span id="times_from_' + info.user.replace(/%/g, '_').replace(/[<>,]/g, '') + "_" + CurrentChat.trackTimeouts[nickname].timesID + '"></span></p></li>');
                    }
                }
            }
        }

        CurrentChat.Chatters.forceLoadViewers = false;
        CurrentChat.Chatters.oldRender = CurrentChat.Chatters.render;
        CurrentChat.Chatters.render = function(t) {
            var n = this;
            if (t.status !== 200) return;
            n.initialRender && (n.element.find(".js-chat-scroll").TrackpadScrollEmulator({ wrapContent: !1, scrollbarHideStrategy: "rightAndBottom"}), n.initialRender = !1);
            ["staff", "admins", "moderators", "viewers"].forEach(function(e) {
                var r = n.element.find(".js-" + e),
                    i = r.find(".js-viewer-list");
                i.empty();
                var s = "";
                if(e === "viewers" && CurrentChat.Chatters.forceLoadViewers === false && t.data.chatter_count > 5000) {
                    s = '<li class="viewer">>_></li>';
                    s += '<li class="viewer">There\'s '+t.data.chatter_count+' chatters..</li>';
                    s += '<li class="viewer">Why are you even here?</li>';
                    s += '<li class="viewer">&nbsp;</li>';
                    s += '<li class="viewer">You <strong>really</strong> want to lag?</li>';
                    s += '<a href="#" style="cursor:pointer;" onclick="CurrentChat.Chatters.forceLoadViewers=true;return false;">Click here to load viewers</a>';
                } else {
                    t.data.chatters[e].forEach(function(e) {
                        var user = '<li class="viewer"><a href="/' + e + '">' + e + '</a></li>';
                        s += user;
                    });
                }
                i.append(s), i.children().length ? r.show() : r.hide()
            });
            n.element.on("click", ".viewer", function(t) {
                t.preventDefault();
                var n = $(this).text(),
                    i = CurrentChat.format_chat_info({ sender: n });
                CurrentChat.setup_chat_popup(i);
                $("#chat_viewers_dropmenu").fadeTo(0, .7);
            });
        }

        $('#chat_text_input').live('keydown', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 9) {
                e.preventDefault();
                var sentence = $('#chat_text_input').val().trim().split(' ');
                var partialMatch = sentence.pop().toLowerCase();
                var users = vars.currentViewers;
                var userIndex = 0;
                if (window.partialMatch === undefined) {
                    window.partialMatch = partialMatch;
                } else if (partialMatch.search(window.partialMatch) !== 0) {
                    window.partialMatch = partialMatch;
                } else if (window.lastMatch !== $('#chat_text_input').val()) {
                    window.partialMatch = partialMatch;
                } else {
                    if (sentence.length === 0) {
                        userIndex = users.indexOf(partialMatch.substr(0, partialMatch.length - 1));
                    } else {
                        userIndex = users.indexOf(partialMatch);
                    }
                    if (e.shiftKey && userIndex > 0) {
                        userIndex = userIndex - 1;
                    }
                }
                for (var i = userIndex; i < users.length; i++) {
                    var user = users[i] || '';
                    if (window.partialMatch.length > 0 && user.search(window.partialMatch, "i") === 0) {
                        if (user === partialMatch || user === partialMatch.substr(0, partialMatch.length - 1)) {
                            continue;
                        }
                        if(CurrentChat.displayNames && CurrentChat.displayNames[user]) {
                            sentence.push(CurrentChat.displayNames[user]);
                        } else {
                            sentence.push(user.capitalize());
                        }
                        if (sentence.length === 1) {
                            $('#chat_text_input').val(sentence.join(' ') + ", ");
                            window.lastMatch = sentence.join(' ') + ", ";
                            window.lastIndex = i;
                        } else {
                            $('#chat_text_input').val(sentence.join(' '));
                            window.lastMatch = sentence.join(' ');
                            window.lastIndex = i;
                        }
                        break;
                    }
                }
            }
            if(CurrentChat.sentHistory) {
                chatField = $("#chat_text_input")[0].value;
                historyIndex = CurrentChat.sentHistory.indexOf(chatField);
                if (keyCode === 38) {
                    if(historyIndex >= 0) {
                        if(CurrentChat.sentHistory[historyIndex+1]) {
                            $("#chat_text_input")[0].value = CurrentChat.sentHistory[historyIndex+1];
                        }
                    } else {
                        if(chatField !== "") {
                            CurrentChat.sentHistory.unshift(chatField);
                            $("#chat_text_input")[0].value = CurrentChat.sentHistory[1];
                        } else {
                            $("#chat_text_input")[0].value = CurrentChat.sentHistory[0];
                        }
                        
                    }
                }
                if (keyCode === 40) {
                    if(historyIndex >= 0) {
                        if(CurrentChat.sentHistory[historyIndex-1]) {
                            $("#chat_text_input")[0].value = CurrentChat.sentHistory[historyIndex-1];
                        } else {
                            $("#chat_text_input")[0].value = "";
                        }
                    }
                }
            }
        });

        $("#chat_lines").scroll(function () {
            var scrollHeight = $("#chat_lines")[0].scrollHeight - $("#chat_lines").height(),
                scrollTop = $("#chat_lines").scrollTop(),
                distanceFromBottom = scrollHeight - scrollTop;

            if (distanceFromBottom >= 20) {
                CurrentChat.currently_scrolling = 0;
                CurrentChat.line_buffer = 9001;
            } else if (CurrentChat.currently_scrolling !== 1) {
                CurrentChat.currently_scrolling = 1;
                if (bttv.settings.get("scrollbackAmount")) {
                    CurrentChat.line_buffer = bttv.settings.get("scrollbackAmount");
                } else {
                    CurrentChat.line_buffer = 150;
                }
            }
        });

        setTimeout(function () {
            updateViewerList(false)
        }, 5000);
        setInterval(function () {
            updateViewerList(true)
        }, 300000);
    }

    var checkFollowing = function () {

        debug.log("Check Following List");

        if($("body#chat").length || !Twitch.user.login()) return;

        /*$(window).on("firebase:follow_online", function (b, f) {
            console.log(b)
            console.log(f)
            if (f.online === true) {
                Twitch.api.get("channels/" + f.name.toLowerCase()).done(function (d) {
                    if (d.name) {
                        $.gritter.add({
                            title: d.display_name + ' is Now Streaming',
                            image: d.logo,
                            text: d.display_name + ' just started streaming ' + d.game + '.<br /><br /><a style="color:white" href="http://www.twitch.tv/' + d.name + '">Click here to head to ' + d.display_name + '\'s channel</a>.',
                        });
                    }
                });
            }
        });*/

        var fetchFollowing = function(callback, followingList, followingNames, offset) {
            var followingList = followingList || [],
                followingNames = followingNames || [],
                offset = offset || 0;

            Twitch.api.get("streams/followed?limit=100&offset="+offset).done(function (d) {
                ga('send', 'event', 'Channels', 'Check Following - Offset: '+offset);
                if (d.streams && d.streams.length > 0) {
                    d.streams.forEach(function(stream) {
                        if(followingNames.indexOf(stream.channel.name) === -1) {
                            followingNames.push(stream.channel.name);
                            followingList.push(stream);
                        }
                    });
                    if(d.streams.length === 100) {
                        fetchFollowing(function(followingList) {
                            callback(followingList);
                        }, followingList, followingNames, offset+100);
                    } else {
                        callback(followingList);
                    }
                } else {
                    callback(followingList);
                }
            });
        }

        fetchFollowing(function(streams) {
            if (vars.liveChannels.length === 0) {
                vars.liveChannels.push("loaded");
                streams.forEach(function(stream) {
                    var channel = stream.channel;
                    if (vars.liveChannels.indexOf(channel.name) === -1) {
                        vars.liveChannels.push(channel.name);
                    }
                });
            } else {
                var channels = [];
                streams.forEach(function(stream) {
                    var channel = stream.channel;
                    channels.push(channel.name);
                    if (vars.liveChannels.indexOf(channel.name) === -1) {
                        debug.log(channel.name+" is now streaming");
                        if (channel.game == null) channel.game = "on Twitch";
                        bttv.notify(channel.display_name + ' just started streaming ' + channel.game + '.\nClick here to head to ' + channel.display_name + '\'s channel.', channel.display_name + ' is Now Streaming', channel.url, channel.logo, 'channel_live_'+channel.name);
                    }
                });
                vars.liveChannels = channels;
            }

            if(!$("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").length) {
                $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"]").append('<span class="total_count js-total" style="display: none;"></span>');
            }
            $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").html(streams.length);
            $("#nav_personal li[data-name=\"following\"] a[href=\"/directory/following\"] .js-total").css("display","inline");

            setTimeout(checkFollowing, 60000);
        });

    }

    var checkBroadcastInfo = function () {

        if(typeof SitePageType == "undefined" || SitePageType !== "channel"  || typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

        debug.log("Check Channel Title/Game");

        Twitch.api.get("channels/"+CurrentChat.channel).done(function (d) {
            if (d.game && d.status) {
                $(".js-title").html(d.status);
                $(".js-game").html(d.game).attr("href",Twitch.uri.game(d.game));
            }
            ga('send', 'event', 'Channels', 'Check Broadcast Info');
            setTimeout(checkBroadcastInfo, 60000);
        });

    }

    var overrideEmotes = function () {

        if (!document.getElementById("chat_lines")) return;

        if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

        debug.log("Overriding Twitch Emoticons");

        var betterttvEmotes = [];

        var oldEmotes = [
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ebf60cd72f7aa600-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d570c4b3b8d8fc4d-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-ae4e17f5b9624e2f-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-b9cbb6884788aa62-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-2cde79cfe74c6169-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-577ade91d46d7edc-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-374120835234cb29-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-cfaf6eac72fe4de6-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-e838e5e34d9f240c-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-3407bf911ad2fd4a-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-0536d670860bf733-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-8e128fa8dc1de29c-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-d31223e81104544a-24x18.png",
            "https://static-cdn.jtvnw.net/jtv_user_pictures/chansub-global-emoticon-9f2ac5d4b53913d7-24x18.png"
        ];
        var newEmotes = [
            "//cdn.betterttv.net/emotes/jtv/happy.gif",
            "//cdn.betterttv.net/emotes/jtv/sad.gif",
            "//cdn.betterttv.net/emotes/jtv/surprised.gif",
            "//cdn.betterttv.net/emotes/jtv/bored.gif",
            "//cdn.betterttv.net/emotes/jtv/cool.gif",
            "//cdn.betterttv.net/emotes/jtv/horny.gif",
            "//cdn.betterttv.net/emotes/jtv/skeptical.gif",
            "//cdn.betterttv.net/emotes/jtv/wink.gif",
            "//cdn.betterttv.net/emotes/jtv/raspberry.gif",
            "//cdn.betterttv.net/emotes/jtv/winkberry.gif",
            "//cdn.betterttv.net/emotes/jtv/pirate.gif",
            "//cdn.betterttv.net/emotes/jtv/drunk.gif",
            "//cdn.betterttv.net/emotes/jtv/angry.gif",
            "//cdn.betterttv.net/emotes/mw.png"
        ];

        CurrentChat.autoCompleteEmotes = {};

        Twitch.api.get("chat/emoticons").done(function (a) {
            var d = CurrentChat.emoticons.length-1;
            var cssString = "";
            if(Twitch.user.isLoggedIn() && CurrentChat.user_to_emote_sets[Twitch.user.login()]) {
                var autoComplete = true;
                var user = Twitch.user.login();
            } else {
                var autoComplete = false;
            }
            CurrentChat.emoticons.forEach(function (emote) {
                if(emote.images) {
                    emote.images.forEach(function (image) {
                        if(oldEmotes.indexOf(image.url) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                            image.url = newEmotes[oldEmotes.indexOf(image.url)];
                            image.height = 22;
                            image.width = 22;
                            var imageCssElement = /\<span class\=\"emo-(.*) emoticon\"\>\<\/span\>/.exec(image.html);
                            if(imageCssElement) {
                                var cssEmote = imageCssElement[1];
                                cssString += CurrentChat.generate_emoticon_css(image, cssEmote);
                            }
                        }
                    });
                }
            });
            CurrentChat.default_emoticons.forEach(function (emote) {
                if(emote.image) {
                    var image = emote.image;
                    if(oldEmotes.indexOf(image.url) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                        image.url = newEmotes[oldEmotes.indexOf(image.url)];
                        image.height = 22;
                        image.width = 22;
                    }
                }
            })
            a.emoticons.forEach(function (a) {
                a.regex.match(/^\w+$/) ? a.regex = new RegExp("\\b" + a.regex + "\\b", "g") : a.regex = new RegExp(a.regex, "g");
                a.images.forEach(function (b) {
                    if(autoComplete === true && CurrentChat.user_to_emote_sets[user].indexOf(b.emoticon_set) !== -1) {
                        var prefixRegex = /^\/\\b([a-z]+)([0-9A-Z][0-9A-Za-z]+)\\b\/g$/,
                            rawCommand = prefixRegex.exec(a.regex);
                        if(rawCommand) {
                            if(/^[a-zA-Z0-9]{5,}$/.test(rawCommand[2])) {
                                CurrentChat.autoCompleteEmotes[rawCommand[2]] = rawCommand[1]+rawCommand[2];
                            }
                        }
                    }
                });
            });
            if (bttv.settings.get("bttvEmotes") !== false) {
                betterttvEmotes.forEach(function (b) {
                    var a = {};
                    a.text = b.regex.replace(/\\/g,"").replace(/\((.*)\|(.*)\)/,"$1");
                    b.regex.match(/^\w+$/) ? a.regex = new RegExp("\\b" + b.regex + "\\b", "g") : a.regex = new RegExp(b.regex, "g");
                    a.channel = b.channel || "BetterTTV Emotes";
                    a.badge = "//cdn.betterttv.net/tags/kappa.png";
                    a.images = [];
                    a.images.push({
                        emoticon_set: null,
                        width: b.width,
                        height: b.height,
                        url: b.url
                    });
                    a.images.forEach(function (c) {
                        d += 1;
                        c.html = ich["chat-emoticon"]({
                            id: d
                        }).prop("outerHTML");
                        cssString += CurrentChat.generate_emoticon_css(c, d);
                        var imageObject = {
                            image: c,
                            regex: a.regex
                        }
                        if(CurrentChat.emoticon_sets) {
                            c.emoticon_set ? (CurrentChat.emoticon_sets[c.emoticon_set] === undefined && (CurrentChat.emoticon_sets[c.emoticon_set] = []), CurrentChat.emoticon_sets[c.emoticon_set].push(imageObject)) : CurrentChat.default_emoticons.push(imageObject);
                        }
                    });
                    CurrentChat.emoticons.push(a);
                });
            }
            cssString += ".emoticon { display: inline-block; }";
            var emoteCSS = document.createElement("style");
            emoteCSS.setAttribute("type", "text/css");
            emoteCSS.innerHTML = cssString;
            $('body').append(emoteCSS);
            handleTwitchChatEmotesScript();
        });

    }

    var updateViewerList = function (modsList) {

        debug.log("Updating Viewer List");

        if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

        var grabChatters = function() {
            if(CurrentChat.Chatters.bttvUpdating !== true) return;
            $.ajax({
                url: "https://tmi.twitch.tv/group/user/" + CurrentChat.channel + "/chatters?update_num=" + CurrentChat.Chatters.bttvUpdateNum + "&callback=?",
                cache: !1,
                dataType: "jsonp",
                timeoutLength: 6E3
            }).done(function (d) {
                CurrentChat.Chatters.bttvUpdating = false;
                ga('send', 'event', 'Chat', 'Update Chatters');
                if (d.data.chatters) {
                    vars.currentViewers = [];
                    ["staff", "admins", "moderators", "viewers"].forEach(function (a) {
                        d.data.chatters[a].forEach(function (a) {
                            vars.currentViewers.push(a);
                        });
                        if(a === "staff" || a === "admins") {
                            d.data.chatters[a].forEach(function (a) {
                                d.data.chatters["moderators"].push(a);
                            });
                        }
                        if(a === "staff") {
                            d.data.chatters[a].forEach(function (a) {
                                if(!CurrentChat.staff[a]) {
                                    var action = {
                                        kind: "staff",
                                        user: a
                                    }
                                    fakeCurrentChat("special_user", action);
                                    debug.log("Added "+a+" as staff");
                                }
                            });
                        }
                        if(a === "admins") {
                            d.data.chatters[a].forEach(function (a) {
                                if(!CurrentChat.admins[a]) {
                                    var action = {
                                        kind: "admin",
                                        user: a
                                    }
                                    fakeCurrentChat("special_user", action);
                                    debug.log("Added "+a+" as admin");
                                }
                            });
                        }
                        /*if(a === "moderators") {
                            d.data.chatters[a].forEach(function (a) {
                                if(!CurrentChat.moderators[a]) {
                                    var action = {
                                        sender: "jtv",
                                        target: a
                                    }
                                    fakeCurrentChat("user_oped", action);
                                    debug.log("Added "+a+" as a mod");
                                }
                            });
                            for (mod in CurrentChat.moderators) {
                                if(CurrentChat.moderators.hasOwnProperty(mod)) {
                                    if(d.data.chatters[a].indexOf(mod) === -1) {
                                       var action = {
                                            sender: "jtv",
                                            target: mod
                                        }
                                        fakeCurrentChat("user_deoped", action);
                                        debug.log("Removed "+mod+" as a mod"); 
                                    }
                                }
                            }
                        }*/
                    });
                }
            }).always(function () {
                if(CurrentChat.Chatters.bttvUpdateNum < CurrentChat.Chatters.MAX_INTERVAL) {
                    CurrentChat.Chatters.bttvUpdateNum++;
                    var waitTime = Math.floor(CurrentChat.Chatters.UPDATE_TIMEOUT * Math.pow(1 + CurrentChat.Chatters.GROWTH_RATE, CurrentChat.Chatters.bttvUpdateNum));
                    if(CurrentChat.Chatters.bttvTimeout) clearTimeout(CurrentChat.Chatters.bttvTimeout);
                    CurrentChat.Chatters.bttvTimeout = setTimeout(grabChatters, waitTime);
                }
            });
        }

        CurrentChat.Chatters.bttvUpdating = true;
        CurrentChat.Chatters.bttvUpdateNum = 0;
        grabChatters();
        if(modsList && CurrentChat.TMIFailedToJoin === false && CurrentChat.checkModsViaCommand === true) {
            if(Twitch.user.login()) {
                CurrentChat.checkingMods = true;
                CurrentChat.checkMods = true;
                CurrentChat.say("/mods");
            }
        }
    }

    var fakeCurrentChat = function (func, action) {
        var n = CurrentChat.handlers[func];
        n && n.call(CurrentChat, action);
    }

    var handleBackground = function () {
        var g = $("#custom_bg"),
            d = g[0];
        if (d && d.getContext) {
            var c = d.getContext("2d"),
                h = $("#custom_bg").attr("image");
            if (!h) {
                $(d).css("background-image", "");
                c.clearRect(0, 0, d.width, d.height);
            } else if (g.css({
                width: "100%",
                "background-position": "center top"
            }), g.hasClass("tiled")) {
                g.css({
                    "background-image": 'url("' + h + '")'
                }).attr("width", 200).attr("height", 200);
                d = c.createLinearGradient(0, 0, 0, 200);
                if (bttv.settings.get("darkenedMode") === true) {
                    d.addColorStop(0, "rgba(20,20,20,0.4)");
                    d.addColorStop(1, "rgba(20,20,20,1)");
                } else {
                    d.addColorStop(0, "rgba(245,245,245,0.65)");
                    d.addColorStop(1, "rgba(245,245,245,1)");
                }
                c.fillStyle = d;
                c.fillRect(0, 0, 200, 200);
            } else {
                var i = document.createElement("IMG");
                i.onload = function () {
                    var a = this.width,
                        d = this.height,
                        h;
                    g.attr("width", a).attr("height", d);
                    c.drawImage(i, 0, 0);
                    if (bttv.settings.get("darkenedMode") === true) {
                        d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(20,20,20)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(20,20,20,0.4)"), h.addColorStop(1, "rgba(20,20,20,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                    } else {
                        d > a ? (h = c.createLinearGradient(0, 0, 0, a), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, a), c.fillStyle = "rgb(245,245,245)", c.fillRect(0, a, a, d - a)) : (h = c.createLinearGradient(0, 0, 0, d), h.addColorStop(0, "rgba(245,245,245,0.65)"), h.addColorStop(1, "rgba(245,245,245,1)"), c.fillStyle = h, c.fillRect(0, 0, a, d))
                    }
                };
                i.src = h;
            }
        }
    };

    var darkenPage = function () {

        if ($("body[data-page=\"ember#ember\"]").length || $("body[data-page=\"chapter#show\"]").length || $("body[data-page=\"archive#show\"]").length || ($("#twitch_chat").length)) {

            if (bttv.settings.get("darkenedMode") === true) {

                debug.log("Darkening Page");

                var darkCSS = document.createElement("link");
                darkCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-dark.css");
                darkCSS.setAttribute("type", "text/css");
                darkCSS.setAttribute("rel", "stylesheet");
                darkCSS.setAttribute("id", "darkTwitch");
                $('body').append(darkCSS);

                $("#main_col .content #stats_and_actions #channel_stats #channel_viewer_count").css("display", "none");
                setTimeout(handleBackground, 1000);
            }

        }

    }

    var splitChat = function () {

        if ($("#twitch_chat").length && bttv.settings.get("splitChat") !== false) {

            debug.log("Splitting Chat");

            var splitCSS = document.createElement("link");
            bttv.settings.get("darkenedMode") === true ? splitCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-split-chat-dark.css") : splitCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-split-chat.css");
            splitCSS.setAttribute("type", "text/css");
            splitCSS.setAttribute("rel", "stylesheet");
            splitCSS.setAttribute("id", "splitChat");
            $('body').append(splitCSS);
        }

    }

    var flipDashboard = function () {

        if ($("#dash_main").length && bttv.settings.get("flipDashboard") === true) {

            debug.log("Flipping Dashboard");

            // We want to move the chat to the left, and the dashboard controls to the right.
            $("#controls_column, #player_column").css({
                float: "right",
                marginLeft: "500px"
            });
            $("#chat").css({
                float: "left",
                left: "20px",
                right: ""
            });

        }

    }

    var formatDashboard = function () {

        if ($("#dash_main").length) {

            debug.log("Formatting Dashboard");

            if(typeof CurrentChat == "undefined") return;

            // Move Page Elements to Sub-DIV & Account for Changes
            if(CurrentChat.flash_loaded) CurrentChat.disconnect();
            removeElement(".line");
            $('<div style="position:relative;" id="bttvDashboard"></div>').appendTo('#dash_main');
            $("#dash_main #controls_column").appendTo("#bttvDashboard");
            $("#dash_main #player_column").appendTo("#bttvDashboard");
            $("#dash_main #chat").appendTo("#bttvDashboard");
            setTimeout(function(){ CurrentChat.clearHandlers(); }, 2000);
            setTimeout(function(){ CurrentChat.setupHandlers(); }, 4000);

            // Small Dashboard Fixes
            $("#commercial_options .dropmenu_action[data-length=150]").html("2m 30s");
            $("#controls_column #form_submit button").attr("class", "primary_button");

        }

    }

    var dashboardViewers = function () {

        if ($("#dash_main").length) {

            debug.log("Updating Dashboard Viewers");

            if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

            // If the Dashboard stream is hidden, we need to update the viewer count.
            Twitch.api.get("streams/" + CurrentChat.channel).done(function (a) {
                if (a.stream && a.stream.viewers) {
                    $("#channel_viewer_count").html(a.stream.viewers);
                } else {
                    $("#channel_viewer_count").html("Offline");
                }
                setTimeout(dashboardViewers, 60000);
            });
        }

    }

    var giveawayCompatibility = function () {

        if ($("#dash_main").length) {

            debug.log("Giveaway Plugin Dashboard Compatibility");

            $(".tga_modal").appendTo("#bttvDashboard");
            $(".tga_button").click(function () {
                if (bttv.settings.get("flipDashboard") === true) {
                    $("#chat").width("330px");
                    $(".tga_modal").css("right", "20px");
                } else {
                    $("#chat").width("330px");
                    $(".tga_modal").css("right", "inherit");
                }
            });
            $("button[data-action=\"close\"]").click(function () {
                $("#chat").width("500px");
            });
        }

    }

    var handleTwitchChatEmotesScript = function () {

        if ($("#twitch_chat").length && bttv.settings.get("clickTwitchEmotes") === true) {

            debug.log("Injecting Twitch Chat Emotes Script");

            var emotesJSInject = document.createElement("script");
            emotesJSInject.setAttribute("src", "//cdn.betterttv.net/js/twitchemotes.js");
            emotesJSInject.setAttribute("type", "text/javascript");
            emotesJSInject.setAttribute("id", "clickTwitchEmotes");
            $("body").append(emotesJSInject);
        }

    }

    var createSettingsMenu = function () {

        var settingsMenu = document.getElementById("chat_settings_dropmenu");
        if (!settingsMenu) return;

        debug.log("Creating BetterTTV Settings Menu");

        var bttvChatSettings = document.createElement("div");
        bttvChatSettings.setAttribute("align", "left");
        bttvChatSettings.setAttribute("id", "bttvsettings");
        bttvChatSettings.style.margin = "0px auto";

        bttvChatSettings.innerHTML = '<ul class="dropmenu_col inline_all"> \
                            <li id="chat_section_chatroom" class="dropmenu_section"> \
                            <br /> \
                            &nbsp;&nbsp;&nbsp;&raquo;&nbsp;BetterTTV \
                            <br /> \
                            ' + ($("body#chat").length ? '<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="blackChatLink" onclick="BetterTTV.action(\'toggleBlackChat\'); return false;">Black Chat (Chroma Key)</a>' : '') + ' \
                            ' + ($("#dash_main").length ? '<a class="dropmenu_action g18_gear-FFFFFF80" href="#" id="flipDashboard" onclick="BetterTTV.action(\'flipDashboard\'); return false;">' + (bttv.settings.get("flipDashboard") === true ? 'Unflip Dashboard' : 'Flip Dashboard') + '</a>' : '') + ' \
                            <a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="BetterTTV.action(\'setBlacklistKeywords\'); return false;">Set Blacklist Keywords</a> \
                            <a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="BetterTTV.action(\'setHighlightKeywords\'); return false;">Set Highlight Keywords</a> \
                            <a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="BetterTTV.action(\'setScrollbackAmount\'); return false;">Set Scrollback Amount</a> \
                            <a class="dropmenu_action g18_trash-FFFFFF80" href="#" onclick="BetterTTV.action(\'clearChat\'); return false;">Clear My Chat</a> \
                            <br /> \
                            ' + (!$("body#chat").length ? '<a class="dropmenu_action g18_gear-FFFFFF80" href="#" onclick="BetterTTV.action(\'openSettings\'); return false;">BetterTTV Settings</a>' : '') + ' \
                            </li> \
                            </ul> \
                            ';

        settingsMenu.appendChild(bttvChatSettings);

        var settingsPanel = document.createElement("div");
        settingsPanel.setAttribute("id", "bttvSettingsPanel");
        settingsPanel.style.display = "none";
        settingsPanel.innerHTML = '<div id="header"> \
                                    <span id="logo"><img height="45px" src="//cdn.betterttv.net/style/logos/settings_logo.png" /></span> \
                                    <ul class="nav"> \
                                        <li><a href="#bttvAbout">About</a></li> \
                                        <li class="active"><a href="#bttvSettings">Settings</a></li> \
                                        <li><a href="#bttvChangelog">Changelog</a></li> \
                                        <li><a href="#bttvPrivacy">Privacy Policy</a></li> \
                                    </ul><span id="close">&times;</span> \
                                   </div> \
                                   <div id="bttvSettings" class="scroll scroll-dark" style="height:425px;"> \
                                      <div class="tse-content"> \
                                        <h2 class="option"> Here you can manage the various BetterTTV options. Click On or Off to toggle settings.</h2> \
                                        <div class="option bttvHiddenSetting" style="display:none;"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Admin/Staff Alert</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Get alerted in chat when admins or staff join \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleAdminStaffAlert" value="false" id="adminStaffAlertFalse"> \
                                                <label for="adminStaffAlertFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleAdminStaffAlert" value="true" id="adminStaffAlertTrue" checked> \
                                                <label for="adminStaffAlertTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Anti-Prefix Completion</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Allows you to use sub emotes (greater than 4 characters) without prefixes (BETA) \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleAntiPrefix" value="false" id="antiPrefixFalse"> \
                                                <label for="antiPrefixFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleAntiPrefix" value="true" id="antiPrefixTrue" checked> \
                                                <label for="antiPrefixTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">BetterTTV Chat</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;A tiny chat bar for personal messaging friends (BETA) \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleBTTVChat" value="false" id="showBTTVChatFalse"> \
                                                <label for="showBTTVChatFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleBTTVChat" value="true" id="showBTTVChatTrue" checked> \
                                                <label for="showBTTVChatTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">BetterTTV Emotes</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Some people don\'t like the extra emoticons :\'( \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleBTTVEmotes" value="false" id="showBTTVEmotesFalse"> \
                                                <label for="showBTTVEmotesFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleBTTVEmotes" value="true" id="showBTTVEmotesTrue" checked> \
                                                <label for="showBTTVEmotesTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">DarkenTTV</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;A slick, grey theme which will make you love the site even more \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDarkTwitch" value="false" id="darkenedModeFalse"> \
                                                <label for="darkenedModeFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDarkTwitch" value="true" id="darkenedModeTrue" checked> \
                                                <label for="darkenedModeTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Default Emoticons</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;BetterTTV replaces the robot emoticons with the old JTV monkey faces by default \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDefaultEmotes" value="false" id="defaultEmotesFalse"> \
                                                <label for="defaultEmotesFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDefaultEmotes" value="true" id="defaultEmotesTrue" checked> \
                                                <label for="defaultEmotesTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Default Purple Buttons</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;BetterTTV replaces the primary buttons with blue ones by default \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="togglePurpleButtons" value="false" id="defaultPurpleButtonsFalse"> \
                                                <label for="defaultPurpleButtonsFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="togglePurpleButtons" value="true" id="defaultPurpleButtonsTrue" checked> \
                                                <label for="defaultPurpleButtonsTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Default to Live Channels</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;BetterTTV can click on "Live Channels" for you in the Directory when enabled \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDirectoryLiveTab" value="false" id="directoryLiveTabFalse" checked> \
                                                <label for="directoryLiveTabFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDirectoryLiveTab" value="true" id="directoryLiveTabTrue"> \
                                                <label for="directoryLiveTabTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Desktop Notifications</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;BetterTTV can send you desktop notifications when you are tabbed out of Twitch \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDesktopNotifications" value="false" id="desktopNotificationsFalse" checked> \
                                                <label for="desktopNotificationsFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDesktopNotifications" value="true" id="desktopNotificationsTrue"> \
                                                <label for="desktopNotificationsTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Double-Click Translation</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Double-clicking on chat lines translates them with Google Translate \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleTranslation" value="false" id="dblclickTranslationFalse" checked> \
                                                <label for="dblclickTranslationFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleTranslation" value="true" id="dblclickTranslationTrue"> \
                                                <label for="dblclickTranslationTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Featured Channels</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;The left sidebar is too cluttered, so BetterTTV removes featured channels by default \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleFeaturedChannels" value="false" id="featuredChannelsFalse"> \
                                                <label for="featuredChannelsFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleFeaturedChannels" value="true" id="featuredChannelsTrue" checked> \
                                                <label for="featuredChannelsTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">HLS Transcoding</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Enables switching resolutions for non-partners (if they appear on mobile devices) (BETA) \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleBTTVHLS" value="false" id="showBTTVHLSFalse"> \
                                                <label for="showBTTVHLSFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleBTTVHLS" value="true" id="showBTTVHLSTrue" checked> \
                                                <label for="showBTTVHLSTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">JTV Chat Tags</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;BetterTTV can replace the chat tags with the ones from JTV \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDefaultTags" value="false" id="defaultTagsFalse"> \
                                                <label for="defaultTagsFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDefaultTags" value="true" id="defaultTagsTrue" checked> \
                                                <label for="defaultTagsTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Remove Deleted Messages</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Make those spammers disappear completely! \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleHideDeletedMessages" value="false" id="hideDeletedMessagesFalse"> \
                                                <label for="hideDeletedMessagesFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleHideDeletedMessages" value="true" id="hideDeletedMessagesTrue" checked> \
                                                <label for="hideDeletedMessagesTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Show Deleted Messages</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Turn this on to change &lt;message deleted&gt; back to users\' messages. \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleDeletedMessages" value="false" id="showDeletedMessagesFalse"> \
                                                <label for="showDeletedMessagesFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleDeletedMessages" value="true" id="showDeletedMessagesTrue" checked> \
                                                <label for="showDeletedMessagesTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Split Chat</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Easily distinguish between messages from different users in chat \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleSplitChat" value="false" id="splitChatFalse"> \
                                                <label for="splitChatFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleSplitChat" value="true" id="splitChatTrue" checked> \
                                                <label for="splitChatTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Self Highlights</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Toggle this off to disable highlights on your own username \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleSelfHighlights" value="false" id="selfHighlightsFalse"> \
                                                <label for="selfHighlightsFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleSelfHighlights" value="true" id="selfHighlightsTrue" checked> \
                                                <label for="selfHighlightsTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            <span style="font-weight:bold;font-size:14px;color:#D3D3D3;">Twitch Chat Emotes</span>&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Why remember emotes when you can "click-to-insert" them (by Ryan Chatham) \
                                            <div class="switch"> \
                                                <input type="radio" class="switch-input switch-off" name="toggleClickTwitchEmotes" value="false" id="clickTwitchEmotesFalse"> \
                                                <label for="clickTwitchEmotesFalse" class="switch-label switch-label-off">Off</label> \
                                                <input type="radio" class="switch-input" name="toggleClickTwitchEmotes" value="true" id="clickTwitchEmotesTrue" checked> \
                                                <label for="clickTwitchEmotesTrue" class="switch-label switch-label-on">On</label> \
                                                <span class="switch-selection"></span> \
                                            </div> \
                                        </div> \
                                        <div class="option"> \
                                            Think something is missing here? Send in a <a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=2" target="_blank">feature request</a>! \
                                        </div> \
                                      </div> \
                                   </div> \
                                   <div id="bttvAbout" style="display:none;"> \
                                    <div class="aboutHalf"> \
                                        <img class="bttvAboutIcon" src="//cdn.betterttv.net/style/logos/bttv_logo.png" /> \
                                        <h1>BetterTTV v'+ bttv.info.version + 'R' + bttv.info.release + '</h1> \
                                        <h2>from your friends at <a href="http://www.nightdev.com" target="_blank">NightDev</a></h2> \
                                        <br /> \
                                    </div> \
                                    <div class="aboutHalf"> \
                                        <h1 style="margin-top: 100px;">Think this addon is awesome?</h1><br /><br /> \
                                        <h2><a target="_blank" href="https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped">Drop a Review on the Chrome Webstore</a></h2> \
                                        <br /> \
                                        <h2>or maybe</h2> \
                                        <br /> \
                                        <h2><a target="_blank" href="http://streamdonations.net/c/night">Support the Developer</a></h2> \
                                        <br /> \
                                    </div> \
                                   </div> \
                                   <div id="bttvPrivacy" class="scroll scroll-dark" style="display:none;height:425px;"> \
                                    <div class="tse-content"></div> \
                                   </div> \
                                   <div id="bttvChangelog" class="scroll scroll-dark" style="display:none;height:425px;"> \
                                    <div class="tse-content"></div> \
                                   </div> \
                                   <div id="footer"> \
                                    <span>BetterTTV &copy; <a href="http://www.nightdev.com" target="_blank">NightDev</a> 2013</span><span style="float:right;"><a href="http://www.nightdev.com/contact" target="_blank">Get Support</a> | <a href="http://bugs.nightdev.com/projects/betterttv/issues/new?tracker_id=1" target="_blank">Report a Bug</a> | <a href="http://streamdonations.net/c/night" target="_blank">Support the Developer</a></span> \
                                   </div>';
        $("body").append(settingsPanel);

        $.get('//cdn.betterttv.net/privacy.html', function (data) {
            if(data) {
                $('#bttvPrivacy .tse-content').html(data);
            }
        });

        $.get('//cdn.betterttv.net/changelog.html?'+ bttv.info.version + 'R' + bttv.info.release, function (data) {
            if(data) {
                $('#bttvChangelog .tse-content').html(data);
            }
        });

        $('#bttvSettingsPanel .scroll').TrackpadScrollEmulator({
            scrollbarHideStrategy: 'rightAndBottom'
        });

        $("#bttvSettingsPanel #close").click(function () {
            $("#bttvSettingsPanel").hide("slow");
        });

        $("#bttvSettingsPanel .nav a").click(function (e) {
            e.preventDefault();
            var tab = $(this).attr("href");

            $("#bttvSettingsPanel .nav a").each(function () {
                var currentTab = $(this).attr("href");
                $(currentTab).hide();
                $(this).parent("li").removeClass("active");
            });

            $(tab).fadeIn();
            $(this).parent("li").addClass("active");
        });

        $('.option input:radio').change(function (e) {
            bttv.action(e.target.name);
        });

        $('.dropmenu_action').each(function () {
            $(this).css("color", "#ffffff");
        });

        $(window).konami({callback:function(){
            $("#bttvSettingsPanel .bttvHiddenSetting").each(function () {
                $(this).show();
            });
        }});

        $('#chat_timestamps').attr("onclick", 'toggle_checkbox("toggle_chat_timestamps");BetterTTV.action("toggleTimestamps");');
        $('#mod_icons').parent().attr("onclick", 'toggle_checkbox("mod_icons");BetterTTV.action("toggleModIcons");');
        $('#mod_icons').attr("id", "mod_icons_bttv");

        bttv.settings.get("darkenedMode") === true ? $('#darkenedModeTrue').prop('checked', true) : $('#darkenedModeFalse').prop('checked', true)
        bttv.settings.get("showDefaultEmotes") === true ? $('#defaultEmotesTrue').prop('checked', true) : $('#defaultEmotesFalse').prop('checked', true);
        bttv.settings.get("showDefaultTags") !== true ? $('#defaultTagsFalse').prop('checked', true) : $('#defaultTagsTrue').prop('checked', true);
        bttv.settings.get("showDirectoryLiveTab") === true ? $('#directoryLiveTabTrue').prop('checked', true) : $('#directoryLiveTabFalse').prop('checked', true);
        bttv.settings.get("showTimestamps") === true ? $('#toggle_chat_timestamps').prop('checked', true) : $('#toggle_chat_timestamps').prop('checked', false);
        bttv.settings.get("showModIcons") === true ? $('#mod_icons_bttv').prop('checked', true) : $('#mod_icons_bttv').prop('checked', false);
        bttv.settings.get("showPurpleButtons") === true ? $('#defaultPurpleButtonsTrue').prop('checked', true) : $('#defaultPurpleButtonsFalse').prop('checked', true);
        bttv.settings.get("splitChat") === false ? $('#splitChatFalse').prop('checked', true) : $('#splitChatTrue').prop('checked', true);
        bttv.settings.get("selfHighlights") !== false ? $('#selfHighlightsTrue').prop('checked', true) : $('#selfHighlightsFalse').prop('checked', true);
        bttv.settings.get("showFeaturedChannels") === true ? $('#featuredChannelsTrue').prop('checked', true) : $('#featuredChannelsFalse').prop('checked', true);
        bttv.settings.get("showDeletedMessages") === true ? $('#showDeletedMessagesTrue').prop('checked', true) : $('#showDeletedMessagesFalse').prop('checked', true);
        bttv.settings.get("bttvChat") === true ? $('#showBTTVChatTrue').prop('checked', true) : $('#showBTTVChatFalse').prop('checked', true);
        bttv.settings.get("bttvEmotes") === false ? $('#showBTTVEmotesFalse').prop('checked', true) : $('#showBTTVEmotesTrue').prop('checked', true);
        bttv.settings.get("hideDeletedMessages") === true ? $('#hideDeletedMessagesTrue').prop('checked', true) : $('#hideDeletedMessagesFalse').prop('checked', true);
        bttv.settings.get("adminStaffAlert") === true ? $('#adminStaffAlertTrue').prop('checked', true) : $('#adminStaffAlertFalse').prop('checked', true);
        bttv.settings.get("clickTwitchEmotes") === true ? $('#clickTwitchEmotesTrue').prop('checked', true) : $('#clickTwitchEmotesFalse').prop('checked', true);
        bttv.settings.get("antiPrefix") === true ? $('#antiPrefixTrue').prop('checked', true) : $('#antiPrefixFalse').prop('checked', true);
        bttv.settings.get("bttvHLS") === true ? $('#showBTTVHLSTrue').prop('checked', true) : $('#showBTTVHLSFalse').prop('checked', true);
        bttv.settings.get("dblclickTranslation") !== false ? $('#dblclickTranslationTrue').prop('checked', true) : $('#dblclickTranslationFalse').prop('checked', true);
        bttv.settings.get("desktopNotifications") === true ? $('#desktopNotificationsTrue').prop('checked', true) : $('#desktopNotificationsFalse').prop('checked', true);
        
    }

    bttv.action = function (action) {
        ga('send', 'event', 'BTTV', 'Action: '+action);
        if (action === "clearChat") {
            removeElement(".line");
            CurrentChat.admin_message("You cleared your own chat (BetterTTV)");
        }
        if (action === "openSettings") {
            $('#chat_settings_dropmenu').hide();
            $('#bttvSettingsPanel').show("slow");
        }
        if (action === "setHighlightKeywords") {
            var keywords = prompt("Type some highlight keywords. Messages containing keywords will turn red to get your attention. Placing your own username here will cause BetterTTV to highlight your own lines. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase. Wildcards are supported.", bttv.settings.get("highlightKeywords"));
            if (keywords != null) {
                keywords = keywords.trim().replace(/\s\s+/g, ' ');
                bttv.settings.save("highlightKeywords", keywords);
                var phraseRegex = /\{.+?\}/g;
                var testCases =  keywords.match(phraseRegex);
                var phraseKeywords = [];
                if(testCases) {
                    for (i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        phraseKeywords.push('"'+testCase.replace(/(^\{|\}$)/g, '').trim()+'"');
                    }
                }

                keywords === "" ? keywords = phraseKeywords : keywords = keywords.split(" ").concat(phraseKeywords);

                if(keywords.indexOf(Twitch.user.login()) !== -1 && bttv.settings.get("selfHighlights") !== false) {
                    CurrentChat.admin_message("Warning: You placed your username in the keywords list. Messages you type will turn red.");
                } else {
                    if (bttv.settings.get("selfHighlights") !== false) {
                        keywords.unshift(Twitch.user.login());
                    }
                }
                
                var keywordList = keywords.join(", ");
                if(keywordList === "") {
                    CurrentChat.admin_message("Highlight Keywords list is empty");
                } else {
                    CurrentChat.admin_message("Highlight Keywords are now set to: " + keywordList);
                }
                
            }
        }
        if (action === "setBlacklistKeywords") {
            var keywords = prompt("Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase. Wildcards are supported.", bttv.settings.get("blacklistKeywords"));
            if (keywords != null) {
                keywords = keywords.trim().replace(/\s\s+/g, ' ');
                bttv.settings.save("blacklistKeywords", keywords);
                var phraseRegex = /\{.+?\}/g;
                var testCases =  keywords.match(phraseRegex);
                var phraseKeywords = [];
                if(testCases) {
                    for (i=0;i<testCases.length;i++) {
                        var testCase = testCases[i];
                        keywords = keywords.replace(testCase, "").replace(/\s\s+/g, ' ').trim();
                        phraseKeywords.push('"'+testCase.replace(/(^\{|\}$)/g, '').trim()+'"');
                    }
                }
                keywords === "" ? keywords = phraseKeywords : keywords = keywords.split(" ").concat(phraseKeywords);
                var keywordList = keywords.join(", ");
                if(keywordList === "") {
                    CurrentChat.admin_message("Blacklist Keywords list is empty");
                } else {
                    CurrentChat.admin_message("Blacklist Keywords are now set to: " + keywordList);
                }
            }
        }
        if (action === "setScrollbackAmount") {
            var lines = prompt("What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.", bttv.settings.get("scrollbackAmount"));
            if (lines != null && lines === "") {
                bttv.settings.save("scrollbackAmount", 150);
                CurrentChat.admin_message("Chat scrollback is now set to: default (150)");
                CurrentChat.line_buffer = 150;
            } else if (lines != null && isNaN(lines) !== true && lines > 0) {
                bttv.settings.save("scrollbackAmount", lines);
                CurrentChat.admin_message("Chat scrollback is now set to: " + lines);
                CurrentChat.line_buffer = parseInt(lines);
            } else {
                CurrentChat.admin_message("Invalid scrollback amount given. Value not saved.");
            }
        }
        if (action === "flipDashboard") {
            if (bttv.settings.get("flipDashboard") === true) {
                bttv.settings.save("flipDashboard", false);
                $("#flipDashboard").html("Flip Dashboard");
                $("#controls_column, #player_column").css({
                    float: "none",
                    marginLeft: "0px"
                });
                $("#chat").css({
                    float: "right",
                    left: "",
                    right: "20px"
                });
            } else {
                bttv.settings.save("flipDashboard", true);
                $("#flipDashboard").html("Unflip Dashboard");
                flipDashboard();
            }
        }
        if (action === "toggleAdminStaffAlert") {
            if (bttv.settings.get("adminStaffAlert") === true) {
                bttv.settings.save("adminStaffAlert", false);
            } else {
                bttv.settings.save("adminStaffAlert", true);
            }
        }
        if (action === "toggleAntiPrefix") {
            if (bttv.settings.get("antiPrefix") === true) {
                bttv.settings.save("antiPrefix", false);
            } else {
                bttv.settings.save("antiPrefix", true);
            }
        }
        if (action === "toggleBTTVChat") {
            if (bttv.settings.get("bttvChat") === true) {
                bttv.settings.save("bttvChat", false);
                window.location.reload();
            } else {
                bttv.settings.save("bttvChat", true);
                betaChat();
            }
        }
        if (action === "toggleBTTVEmotes") {
            if (bttv.settings.get("bttvEmotes") === false) {
                bttv.settings.save("bttvEmotes", true);
                overrideEmotes();
            } else {
                bttv.settings.save("bttvEmotes", false);
                overrideEmotes();
            }
        }
        if (action === "toggleBTTVHLS") {
            if (bttv.settings.get("bttvHLS") === true) {
                bttv.settings.save("bttvHLS", false);
                $("#bttvTranscodes").remove();
                if($("#live_site_player_flash").length && Twitch.player.playerBackup) {
                    $("#live_site_player_flash").replaceWith(Twitch.player.playerBackup);
                }
            } else {
                bttv.settings.save("bttvHLS", true);
                $("#bttvTranscodes").remove();
                bttv.checkForTranscodes();
            }
        }
        if (action === "toggleClickTwitchEmotes") {
            if (bttv.settings.get("clickTwitchEmotes") === true) {
                bttv.settings.save("clickTwitchEmotes", false);
                window.location.reload();
            } else {
                bttv.settings.save("clickTwitchEmotes", true);
                handleTwitchChatEmotesScript();
            }
        }
        if (action === "toggleDefaultEmotes") {
            if (bttv.settings.get("showDefaultEmotes") === true) {
                bttv.settings.save("showDefaultEmotes", false);
            } else {
                bttv.settings.save("showDefaultEmotes", true);
            }
            overrideEmotes();
        }
        if (action === "toggleDefaultTags") {
            if (bttv.settings.get("showDefaultTags") === true) {
                bttv.settings.save("showDefaultTags", false);
            } else {
                bttv.settings.save("showDefaultTags", true);
            }
        }
        if (action === "toggleDeletedMessages") {
            if (bttv.settings.get("showDeletedMessages") === true) {
                bttv.settings.save("showDeletedMessages", false);
            } else {
                bttv.settings.save("showDeletedMessages", true);
            }
        }
        if (action === "toggleDesktopNotifications") {
            if (bttv.settings.get("desktopNotifications") === true) {
                bttv.settings.save("desktopNotifications", false);
                bttv.notify("Desktop notifications are now disabled.");
            } else {
                if(window.Notification) {
                    if (Notification.permission === 'default' || (window.webkitNotifications && webkitNotifications.checkPermission() === 1)) {
                        Notification.requestPermission(function () {
                            if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                bttv.settings.save("desktopNotifications", true);
                                bttv.notify("Desktop notifications are now enabled.");
                            } else {
                                bttv.notify("You denied BetterTTV permission to send you notifications.");
                            }
                        });
                    } else if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                        bttv.settings.save("desktopNotifications", true);
                        bttv.notify("Desktop notifications are now enabled.");
                    } else if (Notification.permission === 'denied' || (window.webkitNotifications && webkitNotifications.checkPermission() === 2)) {
                        Notification.requestPermission(function () {
                            if (Notification.permission === 'granted' || (window.webkitNotifications && webkitNotifications.checkPermission() === 0)) {
                                bttv.settings.save("desktopNotifications", true);
                                bttv.notify("Desktop notifications are now enabled.");
                            } else {
                                bttv.notify("You denied BetterTTV permission to send you notifications.");
                            }
                        });
                    } else {
                        bttv.notify("Your browser is not capable of desktop notifications.");
                    }
                } else {
                    bttv.notify("Your browser is not capable of desktop notifications.");
                }
            }
        }
        if (action === "toggleDirectoryLiveTab") {
            if (bttv.settings.get("showDirectoryLiveTab") === true) {
                bttv.settings.save("showDirectoryLiveTab", false);
            } else {
                bttv.settings.save("showDirectoryLiveTab", true);
            }
        }
        if (action === "toggleHideDeletedMessages") {
            if (bttv.settings.get("hideDeletedMessages") === true) {
                bttv.settings.save("hideDeletedMessages", false);
            } else {
                bttv.settings.save("hideDeletedMessages", true);
            }
        }
        if (action === "toggleTranslation") {
            if (bttv.settings.get("dblclickTranslation") === false) {
                bttv.settings.save("dblclickTranslation", true);
                $(document).on('dblclick', '.chat_line', function() {
                    CurrentChat.translate(this, $(this).closest("li").data("sender"), $(this).data("raw"));
                    $(this).html("Translating..");
                });
            } else {
                bttv.settings.save("dblclickTranslation", false);
                $(document).unbind("dblclick");
            }
        }
        if (action === "toggleTimestamps") {
            if (bttv.settings.get("showTimestamps") === true) {
                bttv.settings.save("showTimestamps", false);
            } else {
                bttv.settings.save("showTimestamps", true);
            }
            bttv.settings.get("showTimestamps") === true ? $('#toggle_chat_timestamps').prop('checked', true) : $('#toggle_chat_timestamps').prop('checked', false);
        }
        if (action === "toggleModIcons") {
            if (bttv.settings.get("showModIcons") === true) {
                bttv.settings.save("showModIcons", false);
            } else {
                bttv.settings.save("showModIcons", true);
            }
            bttv.settings.get("showModIcons") === true ? $('#mod_icons_bttv').prop('checked', true) : $('#mod_icons_bttv').prop('checked', false);
        }
        if (action === "togglePurpleButtons") {
            if (bttv.settings.get("showPurpleButtons") === true) {
                bttv.settings.save("showPurpleButtons", false);
                cssBlueButtons();
            } else {
                bttv.settings.save("showPurpleButtons", true);
                $("#bttvBlueButtons").remove();
            }
        }
        if (action === "toggleDarkTwitch") {
            if (bttv.settings.get("darkenedMode") === true) {
                bttv.settings.save("darkenedMode", false);
                $("#darkTwitch").remove();
                handleBackground();
                if (bttv.settings.get("splitChat") !== false) {
                    $("#splitChat").remove();
                    splitChat();
                }
            } else {
                bttv.settings.save("darkenedMode", true);
                darkenPage();
                if (bttv.settings.get("splitChat") !== false) {
                    $("#splitChat").remove();
                    splitChat();
                }
            }
        }
        if (action === "toggleSplitChat") {
            if (bttv.settings.get("splitChat") === false) {
                bttv.settings.save("splitChat", true);
                splitChat();
            } else {
                bttv.settings.save("splitChat", false);
                $("#splitChat").remove();
            }
        }
        if (action === "toggleBlackChat") {
            if (vars.blackChat) {
                vars.blackChat = false;
                $("#blackChat").remove();
                darkenPage();
                splitChat();
                $("#blackChatLink").html("Black Chat (Chroma Key)");
            } else {
                vars.blackChat = true;
                $("#darkTwitch").remove();
                $("#splitChat").remove();
                var darkCSS = document.createElement("link");
                darkCSS.setAttribute("href", "//cdn.betterttv.net/style/stylesheets/betterttv-blackchat.css");
                darkCSS.setAttribute("type", "text/css");
                darkCSS.setAttribute("rel", "stylesheet");
                darkCSS.setAttribute("id", "blackChat");
                darkCSS.innerHTML = '';
                $('body').append(darkCSS);
                $("#blackChatLink").html("Unblacken Chat");
            }
        }
        if (action === "toggleSelfHighlights") {
            if (bttv.settings.get("selfHighlights") !== false) {
                bttv.settings.save("selfHighlights", false);
            } else {
                bttv.settings.save("selfHighlights", true);
            }
        }
        if (action === "toggleFeaturedChannels") {
            if (bttv.settings.get("showFeaturedChannels") === true) {
                bttv.settings.save("showFeaturedChannels", false);
                removeElement('#nav_games');
                removeElement('#nav_streams');
                removeElement('#nav_related_streams');
            } else {
                bttv.settings.save("showFeaturedChannels", true);
                displayElement('#nav_games');
                displayElement('#nav_streams');
                displayElement('#nav_related_streams');
            }
        }
    }

    bttv.HLSTranscodes = function () {
        Twitch.hls.requestPlaylistForChannel(CurrentChat.channel, function(location) {
            if(location) {
                $.ajax({url: location, cache: !1, timeoutLength: 6E3}).done(function (playlist) {
                    if(playlist) {
                        var playlistRegex = /#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=(.*),VIDEO="(.*)"\n(.*)\n/g;
                        var playlistExists = playlist.match(playlistRegex);

                        if(playlistExists) {
                            Twitch.player.playerBackup = $("#live_site_player_flash")[0];
                            $(".live_site_player_container [name=\"standard_holder\"]").replaceWith('<div width="100%" height="100%" name="standard_holder" id="hPlayer"></div>');
                            hPlayer.init({});
                            $(".live_site_player_container [name=\"standard_holder\"]").css("visibility","inherit");
                            $("#bttvTranscodes").remove();
                            $("#stats_and_actions").prepend('<div id="bttvTranscodes">Change your resolution: <a href="#" id="bttv_changeres_twitch">Normal Twitch Player</a></div>');
                            $("#bttv_changeres_twitch").click(function() {
                                $(".live_site_player_container [name=\"standard_holder\"]").replaceWith(Twitch.player.playerBackup);
                                delete Twitch.player.playerBackup;
                                $("#bttvTranscodes").remove();
                                bttv.checkForTranscodes();
                            });
                            var count = 0,
                                stream;
                            while((stream = playlistRegex.exec(playlist)) !== null) {
                                var bandwidth = Math.round(stream[1]/1024),
                                    name = stream[2].capitalize(),
                                    res = name.replace("High","720p").replace("Medium","480p").replace("Low","360p").replace("Mobile","226p").replace("Chunked","Source");
                                    url = stream[3];

                                count++;
                                if(count === 1) {
                                    hPlayer.play({ stream: url });
                                }
                                $("#hPlayer-plugin")[0].playlist.add(url,name);
                                $("#bttvTranscodes").append(' | <a href="#" id="bttv_changeres_'+name+'" data-location="'+url+'">'+name+' ('+res+' @ '+bandwidth+'kbps)</a>');
                                $("#bttv_changeres_"+name).click(function() {
                                    hPlayer.play({ stream: $(this).data("location") });
                                });
                            }
                        }
                    }
                });
            }
        });   
    }

    bttv.checkForTranscodes = function() {
        if(typeof CurrentChat == "undefined" || !CurrentChat.channel) return;

        if(bttv.settings.get("bttvHLS") === true) {
            var vlcVersion = checkVLCVersion();
            if(vlcVersion) {
                Twitch.api.get("/api/channels/"+CurrentChat.channel).done(function (channelInfo) {
                    if(channelInfo.partner === false) {
                        Twitch.hls.requestPlaylistForChannel(CurrentChat.channel, function(location) {
                            if(location) {

                                if(!vars.HLSPlayerLoaded) {
                                    var playerCSS = document.createElement("link");
                                    playerCSS.setAttribute("href", "//cdn.betterttv.net/player/css/hPlayer.css");
                                    playerCSS.setAttribute("type", "text/css");
                                    playerCSS.setAttribute("rel", "stylesheet");
                                    $("body").append(playerCSS);

                                    var playerJS = document.createElement("script");
                                    playerJS.setAttribute("src", "//cdn.betterttv.net/player/js/hPlayer.js");
                                    playerJS.setAttribute("type", "text/javascript");
                                    $("body").append(playerJS);

                                    vars.HLSPlayerLoaded = true;
                                }
                                
                                if(vlcVersion !== "2.1.0") {
                                    $("#stats_and_actions").prepend('<div id="bttvTranscodes">Change your resolution: <a href="#" id="bttv_changeres_init">Enable BetterTTV HLS</a> (VLC Plugin v'+vlcVersion+' detected, please upgrade to <a href="http://www.videolan.org/vlc/index.html" target="_blank">v2.1.0</a>)</div>');
                                } else {
                                    $("#stats_and_actions").prepend('<div id="bttvTranscodes">Change your resolution: <a href="#" id="bttv_changeres_init">Enable BetterTTV HLS</a> (VLC Plugin v'+vlcVersion+' detected)</div>');
                                }
                                $("#bttv_changeres_init").click(function() {
                                    bttv.HLSTranscodes();
                                });
                            }
                        });
                    }
                });
            } else {
                $("#stats_and_actions").prepend('<div id="bttvTranscodes">Change your resolution: No VLC Plugin detected. Install <a href="http://www.videolan.org/vlc/index.html" target="_blank">VLC media player</a>.</div>');
            }
        }
    }

    var handleLookupServer = function() {
        var socketJSInject = document.createElement("script");
        socketJSInject.setAttribute("src", "//cdn.betterttv.net/js/socket.io.js");
        socketJSInject.setAttribute("type", "text/javascript");
        $("head").append(socketJSInject);
    }

    var checkJquery = function () {
        if (typeof ($j) === 'undefined') {
            debug.log("jQuery is undefined.");
            setTimeout(checkJquery, 1000);
            return;
        } else {
            var $ = $j;
            bttv.jQuery = $;
            main();
        }
    }

    var main = function () {
        bttv.settings.load();
        
        $(document).ready(function () {
            debug.log("BTTV v" + bttv.info.version + 'R' + bttv.info.release);
            debug.log("CALL init " + document.URL);

            handleLookupServer();
            brand();
            clearClutter();
            channelReformat();
            checkMessages();
            checkFollowing();
            checkBroadcastInfo();
            darkenPage();
            splitChat();
            flipDashboard();
            formatDashboard();
            giveawayCompatibility();
            dashboardViewers();
            directoryLiveTab();
            
            $(window).trigger('resize');
            setTimeout(chatFunctions, 3000);
            setTimeout(createSettingsMenu, 1000);
            setTimeout(bttv.checkForTranscodes, 5000);
            setTimeout(directoryLiveTab, 5000);

            (function(b){b.gritter={};b.gritter.options={position:"top-left",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(!g.text){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})($);
            
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            (function(e){e.fn.konami=function(t){var n=[];var r={left:37,up:38,right:39,down:40,a:65,b:66};var i=e.extend({code:["up","up","down","down","left","right","left","right","b","a"],callback:function(){}},t);var s=i.code;var o=[];$.each(s,function(e){if(s[e]!==undefined&&r[s[e]]!==undefined){o.push(r[s[e]])}else if(s[e]!==undefined&&typeof s[e]=="number"){o.push(s[e])}});$(document).keyup(function(e){var t=e.keyCode?e.keyCode:e.charCode;n.push(t);if(n.toString().indexOf(o)>=0){n=[];i.callback($(this))}})}})($);

            ga('create', 'UA-39733925-4', 'betterttv.net');
            ga('send', 'pageview');
        });
    }

    if (document.URL.indexOf("receiver.html") !== -1 || document.URL.indexOf("cbs_ad_local.html") !== -1) {
        debug.log("HTML file called by Twitch.");
        return;
    }

    if(location.pathname.match(/^\/(.*)\/popout/)) {
        debug.log("Popout player detected.");
        return;
    }

    try {
        if (BTTVLOADED === true) return;
    } catch (err) {
        debug.log("BTTV LOADED " + document.URL);
        BTTVLOADED = true;
        checkJquery();
    }

}(window.BetterTTV = window.BetterTTV || {}));