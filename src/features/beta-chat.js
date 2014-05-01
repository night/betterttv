var debug = require('debug'),
    vars = require('vars');

module.exports = function () {
    if (bttv.settings.get("bttvChat") === true && vars.userData.isLoggedIn) {

        if($("body#chat").length || $('body[data-page="ember#chat"]').length) return;

        debug.log("Running Beta Chat");

        if(!vars.betaChatLoaded) {
            vars.betaChatLoaded = true;
            $.getJSON("//chat.betterttv.net/login.php?onsite=true&user="+vars.userData.login+"&callback=?", function(d) {

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
        }

        if(!bttv.getChannel()) return;
        $('body').append("<style>.ember-chat .chat-interface .textarea-contain { bottom: 70px !important; } .ember-chat .chat-interface .chat-buttons-container { top: 75px !important; } .ember-chat .chat-interface { height: 140px; } .ember-chat .chat-messages { bottom: 134px; } .ember-chat .chat-settings { bottom: 68px; } .ember-chat .emoticon-selector { bottom: 135px !important; }</style>");
    }
}