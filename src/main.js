var keyCodes = require('./keycodes');

// Declare public and private variables
var debug = require('./helpers/debug'),
    vars = require('./vars'),
    TwitchAPI = require('./twitch-api'),
    io = require('./socketio'),
    storage = require('./storage'),
    settings = require('./settings');

bttv.info = {
    version: "6.8",
    release: 41,
    versionString: function() {
        return bttv.info.version + 'R' + bttv.info.release;
    }
};

bttv.TwitchAPI = TwitchAPI;
bttv.vars = vars;
bttv.storage = new storage();
bttv.settings = new settings();

bttv.getChannel = function() {
    if(window.Ember && window.App && App.__container__.lookup("controller:application").get("currentRouteName") === "channel.index") {
        return App.__container__.lookup("controller:channel").get('id');
    } else if(bttv.getChatController() && bttv.getChatController().currentRoom) {
        return bttv.getChatController().currentRoom.id;
    } else if(window.PP && PP.channel) {
        return PP.channel;
    } else {
        return '';
    }
}

bttv.getChatController = function() {
    if(window.Ember && window.App && App.__container__.lookup("controller:chat")) {
        return App.__container__.lookup("controller:chat");
    } else {
        return false;
    }
}

bttv.notify = function(message, title, url, image, tag, permanent) {
    var title = title || "Notice",
        url = url || "",
        image = image || "https://cdn.betterttv.net/style/logos/bttv_logo.png",
        message = message || "",
        tag = tag || "bttv_"+message,
        tag = "bttv_"+tag.toLowerCase().replace(/[^\w_]/g, ''),
        permanent = permanent || false;

    if($("body#chat").length) return;

    var desktopNotify = function(message, title, url, image, tag, permanent) {
        var notification = new window.Notification(title, {
            icon: image,
            body: message,
            tag: tag
        });
        if(permanent === false) {
            notification.onshow = function() {
                setTimeout(function() {
                    notification.close();
                }, 10000)
            }
        }
        if(url !== "") {
            notification.onclick = function() {
                window.open(url);
                notification.close();
            }
        }
        bttv.storage.pushObject("bttvNotifications", tag, { expire: Date.now()+60000 });
        setTimeout(function() { bttv.storage.spliceObject("bttvNotifications", tag); }, 60000);
    }

    if(bttv.settings.get("desktopNotifications") === true && ((window.Notification && Notification.permission === 'granted') || (window.webkitNotifications && webkitNotifications.checkPermission() === 0))) {
        var notifications = bttv.storage.getObject("bttvNotifications");
        for(var notification in notifications) {
            if(notifications.hasOwnProperty(notification)) {
                var expireObj = notifications[notification];
                if(notification === tag) {
                    if(expireObj.expire < Date.now()) {
                        bttv.storage.spliceObject("bttvNotifications", notification);
                    } else {
                        return;
                    }
                }
            }
        }
        desktopNotify(message, title, url, image, tag, permanent);
    } else {
        message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, "<br /><br />").replace(/Click here(.*)./, '<a style="color: white;" target="_blank" href="'+url+'">Click here$1.</a>');
        $.gritter.add({
            title: title,
            image: image,
            text: message,
            sticky: permanent
        });
    }
}

bttv.chat = require('./chat');

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var clearClutter = require('./features/clear-clutter'),
    channelReformat = require('./features/channel-reformat'),
    brand = require('./features/brand'),
    betaChat = require('./features/beta-chat'),
    checkMessages = require('./features/check-messages'),
    directoryFunctions = require('./features/directory-functions'),
    checkFollowing = require('./features/check-following'),
    checkBroadcastInfo = require('./features/check-broadcast-info'),
    handleBackground = require('./features/handle-background'),
    darkenPage = require('./features/darken-page'),
    splitChat = require('./features/split-chat'),
    flipDashboard = require('./features/flip-dashboard'),
    formatDashboard = require('./features/format-dashboard'),
    dashboardChannelInfo = require('./features/dashboard-channelinfo'),
    giveawayCompatibility = require('./features/giveaway-compatibility'),
    handleTwitchChatEmotesScript = require('./features/handle-twitchchat-emotes'),
    emoticonTextInClipboard = require('./features/emoticon-text-in-clipboard'),
    createSettings = require('./features/create-settings');
    enableImagePreview = require('./features/image-preview').enablePreview;
    enableTheatreMode = require('./features/auto-theatre-mode');
    hostButtonBelowVideo = require('./features/host-btn-below-video');

var chatFunctions = function () {
    debug.log("Modifying Chat Functionality");

    if(bttv.getChatController() && bttv.getChannel()) {
        bttv.chat.takeover();
    }
}

var checkJquery = function(times) {
    times = times || 0;
    if(times > 9) return;
    if(typeof (window.jQuery) === 'undefined') {
        debug.log("jQuery is undefined.");
        setTimeout(function() { checkJquery(times+1); }, 1000);
        return;
    } else {
        var $ = window.jQuery;
        bttv.jQuery = $;
        main();
    }
}

var main = function () {
    if(window.Ember) {
        var renderingCounter = 0;

        var waitForLoad = function(callback, count) {
            var count = count || 0;
            if(count > 5) {
                callback(false);
            }
            setTimeout(function() {
                if(renderingCounter === 0) {
                    callback(true);
                } else {
                    waitForLoad(callback, ++count);
                }
            }, 1000);
        }

        Ember.subscribe('render', {
            before: function() {
                renderingCounter++;
            },
            after: function(name, ts, payload) {
                renderingCounter--;

                if(!payload.template) return;
                //debug.log(payload.template);

                if(App.__container__.lookup("controller:application").get("currentRouteName") !== "channel.index") {
                    $('#main_col').removeAttr('style');
                }

                switch(payload.template) {
                    case 'shared/right-column':
                        waitForLoad(function(ready) {
                            if(ready) {
                                bttv.chat.store.isLoaded = false;
                                betaChat();
                                chatFunctions();
                            }
                        });
                        break;
                    case 'channel/index':
                        waitForLoad(function(ready) {
                            if(ready) {
                                handleBackground();
                                clearClutter();
                                channelReformat();
                                hostButtonBelowVideo();
                                if (
                                    App.__container__.lookup("controller:channel").get("theatreMode") === false && 
                                    bttv.settings.get('autoTheatreMode') === true
                                ) {
                                    enableTheatreMode();
                                }
                                $(window).trigger('resize');
                                setTimeout(function() {
                                    $(window).trigger('resize');
                                }, 3000);
                            }
                        });
                        break;
                    case 'channel/profile':
                        waitForLoad(function(ready) {
                            if(ready) {
                                vars.emotesLoaded = false;
                                betaChat();
                                chatFunctions();
                                channelReformat();
                                $(window).trigger('resize');
                            }
                        });
                        break;
                    case 'directory/following':
                        waitForLoad(function(ready) {
                            if(ready) {
                                directoryFunctions();
                            }
                        });
                        break;
                }
            }
        });
    }

    $(document).ready(function () {
        createSettings();
        bttv.settings.load();

        debug.log("BTTV v" + bttv.info.versionString());
        debug.log("CALL init " + document.URL);

        bttv.io = new io();

        clearClutter();
        channelReformat();
        checkBroadcastInfo();
        brand();
        darkenPage();
        splitChat();
        flipDashboard();
        formatDashboard();
        checkMessages();
        checkFollowing();
        giveawayCompatibility();
        dashboardChannelInfo();
        directoryFunctions();
        handleTwitchChatEmotesScript();
        emoticonTextInClipboard();
        hostButtonBelowVideo();

        if (bttv.settings.get('chatImagePreview') === true) {
            enableImagePreview();
        }
        if (bttv.settings.get('autoTheatreMode') === true) {
            enableTheatreMode();
        }

        $(window).trigger('resize');
        setTimeout(function() {
            channelReformat();
            vars.userData.isLoggedIn = Twitch.user.isLoggedIn();
            vars.userData.login = Twitch.user.login();
            $(window).trigger('resize');
        }, 3000);
        setTimeout(chatFunctions, 3000);
        setTimeout(directoryFunctions, 3000);

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','__bttvga');

        __bttvga('create', 'UA-39733925-4', { cookieName: '__bttvga' });
        __bttvga('send', 'pageview');

        (function(b){b.gritter={};b.gritter.options={position:"top-left",class_name:"",fade_in_speed:"medium",fade_out_speed:1000,time:6000};b.gritter.add=function(f){try{return a.add(f||{})}catch(d){var c="Gritter Error: "+d;(typeof(console)!="undefined"&&console.error)?console.error(c,f):alert(c)}};b.gritter.remove=function(d,c){a.removeSpecific(d,c||{})};b.gritter.removeAll=function(c){a.stop(c||{})};var a={position:"",fade_in_speed:"",fade_out_speed:"",time:"",_custom_timer:0,_item_count:0,_is_setup:0,_tpl_close:'<div class="gritter-close"></div>',_tpl_title:'<span class="gritter-title">[[title]]</span>',_tpl_item:'<div id="gritter-item-[[number]]" class="gritter-item-wrapper [[item_class]]" style="display:none"><div class="gritter-top"></div><div class="gritter-item">[[close]][[image]]<div class="[[class_name]]">[[title]]<p>[[text]]</p></div><div style="clear:both"></div></div><div class="gritter-bottom"></div></div>',_tpl_wrap:'<div id="gritter-notice-wrapper"></div>',add:function(g){if(typeof(g)=="string"){g={text:g}}if(!g.text){throw'You must supply "text" parameter.'}if(!this._is_setup){this._runSetup()}var k=g.title,n=g.text,e=g.image||"",l=g.sticky||false,m=g.class_name||b.gritter.options.class_name,j=b.gritter.options.position,d=g.time||"";this._verifyWrapper();this._item_count++;var f=this._item_count,i=this._tpl_item;b(["before_open","after_open","before_close","after_close"]).each(function(p,q){a["_"+q+"_"+f]=(b.isFunction(g[q]))?g[q]:function(){}});this._custom_timer=0;if(d){this._custom_timer=d}var c=(e!="")?'<img src="'+e+'" class="gritter-image" />':"",h=(e!="")?"gritter-with-image":"gritter-without-image";if(k){k=this._str_replace("[[title]]",k,this._tpl_title)}else{k=""}i=this._str_replace(["[[title]]","[[text]]","[[close]]","[[image]]","[[number]]","[[class_name]]","[[item_class]]"],[k,n,this._tpl_close,c,this._item_count,h,m],i);if(this["_before_open_"+f]()===false){return false}b("#gritter-notice-wrapper").addClass(j).append(i);var o=b("#gritter-item-"+this._item_count);o.fadeIn(this.fade_in_speed,function(){a["_after_open_"+f](b(this))});if(!l){this._setFadeTimer(o,f)}b(o).bind("mouseenter mouseleave",function(p){if(p.type=="mouseenter"){if(!l){a._restoreItemIfFading(b(this),f)}}else{if(!l){a._setFadeTimer(b(this),f)}}a._hoverState(b(this),p.type)});b(o).find(".gritter-close").click(function(){a.removeSpecific(f,{},null,true)});return f},_countRemoveWrapper:function(c,d,f){d.remove();this["_after_close_"+c](d,f);if(b(".gritter-item-wrapper").length==0){b("#gritter-notice-wrapper").remove()}},_fade:function(g,d,j,f){var j=j||{},i=(typeof(j.fade)!="undefined")?j.fade:true,c=j.speed||this.fade_out_speed,h=f;this["_before_close_"+d](g,h);if(f){g.unbind("mouseenter mouseleave")}if(i){g.animate({opacity:0},c,function(){g.animate({height:0},300,function(){a._countRemoveWrapper(d,g,h)})})}else{this._countRemoveWrapper(d,g)}},_hoverState:function(d,c){if(c=="mouseenter"){d.addClass("hover");d.find(".gritter-close").show()}else{d.removeClass("hover");d.find(".gritter-close").hide()}},removeSpecific:function(c,g,f,d){if(!f){var f=b("#gritter-item-"+c)}this._fade(f,c,g||{},d)},_restoreItemIfFading:function(d,c){clearTimeout(this["_int_id_"+c]);d.stop().css({opacity:"",height:""})},_runSetup:function(){for(opt in b.gritter.options){this[opt]=b.gritter.options[opt]}this._is_setup=1},_setFadeTimer:function(f,d){var c=(this._custom_timer)?this._custom_timer:this.time;this["_int_id_"+d]=setTimeout(function(){a._fade(f,d)},c)},stop:function(e){var c=(b.isFunction(e.before_close))?e.before_close:function(){};var f=(b.isFunction(e.after_close))?e.after_close:function(){};var d=b("#gritter-notice-wrapper");c(d);d.fadeOut(function(){b(this).remove();f()})},_str_replace:function(v,e,o,n){var k=0,h=0,t="",m="",g=0,q=0,l=[].concat(v),c=[].concat(e),u=o,d=c instanceof Array,p=u instanceof Array;u=[].concat(u);if(n){this.window[n]=0}for(k=0,g=u.length;k<g;k++){if(u[k]===""){continue}for(h=0,q=l.length;h<q;h++){t=u[k]+"";m=d?(c[h]!==undefined?c[h]:""):c[0];u[k]=(t).split(l[h]).join(m);if(n&&u[k]!==t){this.window[n]+=(t.length-u[k].length)/l[h].length}}}return p?u:u[0]},_verifyWrapper:function(){if(b("#gritter-notice-wrapper").length==0){b("body").append(this._tpl_wrap)}}}})($);
        (function(e){e.fn.drags=function(t){t=e.extend({handle:"",cursor:"move",el:""},t);if(t.handle===""){var n=this}else{var n=this.find(t.handle)}return n.css("cursor",t.cursor).on("mousedown",function(n){if(t.handle===""){var r=e(this).addClass("bttv-draggable")}else{if(t.el===""){var r=e(this).addClass("active-handle").parent().addClass("bttv-draggable")}else{e(this).addClass("active-handle");var r=e(t.el).addClass("bttv-draggable")}}var i=r.css("z-index"),s=r.outerHeight(),o=r.outerWidth(),u=r.offset().top+s-n.pageY,a=r.offset().left+o-n.pageX;r.css("z-index",1e3).parents().on("mousemove",function(t){e(".bttv-draggable").offset({top:t.pageY+u-s,left:t.pageX+a-o}).on("mouseup",function(){e(this).removeClass("bttv-draggable").css("z-index",i)})});n.preventDefault()}).on("mouseup",function(){if(t.handle===""){e(this).removeClass("bttv-draggable")}else{e(this).removeClass("active-handle");e(t.el).removeClass("bttv-draggable")}})}})(jQuery);            (function(e){e.fn.konami=function(t){var n=[];var r={left:37,up:38,right:39,down:40,a:65,b:66};var i=e.extend({code:["up","up","down","down","left","right","left","right","b","a"],callback:function(){}},t);var s=i.code;var o=[];$.each(s,function(e){if(s[e]!==undefined&&r[s[e]]!==undefined){o.push(r[s[e]])}else if(s[e]!==undefined&&typeof s[e]=="number"){o.push(s[e])}});$(document).keyup(function(e){var t=e.keyCode?e.keyCode:e.charCode;n.push(t);if(n.toString().indexOf(o)>=0){n=[];i.callback($(this))}})}})($);
        $(window).konami({callback:function(){
            $("#bttvSettingsPanel .konami").each(function(){$(this).show()});
        }});
    });
}

if(document.URL.indexOf("receiver.html") !== -1 || document.URL.indexOf("cbs_ad_local.html") !== -1) {
    debug.log("HTML file called by Twitch.");
    return;
}

if(location.pathname.match(/^\/(.*)\/popout/)) {
    debug.log("Popout player detected.");
    return;
}

if(!window.Twitch) {
    debug.log("window.Twitch not detected.");
    return;
}

if(window.BTTVLOADED === true) return;
debug.log("BTTV LOADED " + document.URL);
BTTVLOADED = true;
checkJquery();
