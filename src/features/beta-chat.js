var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function() {
    if (bttv.settings.get('bttvChat') === true && vars.userData.isLoggedIn) {
        if ($('body#chat').length || $('body[data-page="ember#chat"]').length) return;

        debug.log('Running Beta Chat');

        if (!vars.betaChatLoaded) {
            vars.betaChatLoaded = true;
            $.getJSON('https://chat.betterttv.net/login.php?onsite=true&verify=true&callback=?', function(d) {
                if (d.status === true) {
                    debug.log('Logged into BTTV Chat');
                } else {
                    $.getJSON('https://chat.betterttv.net/login.php?onsite=true&user=' + vars.userData.name + '&callback=?');
                    debug.log('Not logged into BTTV Chat');
                }

                setTimeout(function() {
                    var chatDJSInject = document.createElement('script');
                    chatDJSInject.setAttribute('src', 'https://chat.betterttv.net/chat/cometchatjs.php');
                    chatDJSInject.setAttribute('type', 'text/javascript');
                    $('body').append(chatDJSInject);
                }, 5000);
            });

            var chatCSSInject = document.createElement('link');
            chatCSSInject.setAttribute('href', 'https://chat.betterttv.net/chat/cometchatcss.php');
            chatCSSInject.setAttribute('type', 'text/css');
            chatCSSInject.setAttribute('id', 'arrowchat_css');
            chatCSSInject.setAttribute('rel', 'stylesheet');
            $('head').append(chatCSSInject);
        }

        if (!bttv.getChannel()) return;
        $('body').append('<style>.ember-chat .chat-interface { height: 140px !important; } .ember-chat .chat-messages { bottom: 140px; } .ember-chat .chat-settings { bottom: 80px; } .ember-chat .emoticon-selector { bottom: 142px !important; }</style>');
    }
};
