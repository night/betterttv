var debug = require('../helpers/debug'),
    vars = require('../vars'),
    removeElement = require('../helpers/element').remove;
var darkenPage = require('./darken-page'),
    splitChat = require('./split-chat');

module.exports = function() {
    if(!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

    debug.log("Loading BetterTTV Chat Settings");

    $('.ember-chat .chat-settings .clear-chat').remove();

    var settings = require('../templates/chat-settings')();

    var $settings = $('<div></div>');

    $settings.attr('class', 'bttvChatSettings');
    $settings.html(settings);

    $('.ember-chat .chat-interface .chat-settings').append($settings);

    if($('body[data-page="ember#chat"]').length) {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            bttv.settings.popup();
        });
    } else {
        $('.openSettings').click(function(e) {
            e.preventDefault();
            $('.chat-option-buttons .settings').click();
            $('#bttvSettingsPanel').show("slow");
        });
    }

    $('.blackChatLink').click(function(e) {
        e.preventDefault();
        if (vars.blackChat) {
            vars.blackChat = false;
            $("#blackChat").remove();
            darkenPage();
            splitChat();
            $(".blackChatLink").text("Black Chat (Chroma Key)");
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
            $(".blackChatLink").text("Unblacken Chat");
        }
    });

    $('.clearChat').click(function(e) {
        e.preventDefault();
        removeElement(".chat-line");
    });

    $('.toggleDarkenTTV').change(function(e) {
        e.preventDefault();
        if (bttv.settings.get("darkenedMode") === true) {
            bttv.settings.save("darkenedMode", false);
            $(this).prop('checked', false);
        } else {
            bttv.settings.save("darkenedMode", true);
            $(this).prop('checked', true);
        }
    });

    $('.flipDashboard').click(function(e) {
        e.preventDefault();
        if (bttv.settings.get("flipDashboard") === true) {
            bttv.settings.save("flipDashboard", false);
        } else {
            bttv.settings.save("flipDashboard", true);
        }
    });

    $('.setBlacklistKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt("Type some blacklist keywords. Messages containing keywords will be filtered from your chat. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase. Wildcards are supported.", bttv.settings.get("blacklistKeywords"));
        if (keywords != null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save("blacklistKeywords", keywords);
        }
    });

    $('.setHighlightKeywords').click(function(e) {
        e.preventDefault();
        var keywords = prompt("Type some highlight keywords. Messages containing keywords will turn red to get your attention. Use spaces in the field to specify multiple keywords. Place {} around a set of words to form a phrase, and () around a word to specify a username. Wildcards are supported.", bttv.settings.get("highlightKeywords"));
        if (keywords != null) {
            keywords = keywords.trim().replace(/\s\s+/g, ' ');
            bttv.settings.save("highlightKeywords", keywords);
        }
    });

    $('.setScrollbackAmount').click(function(e) {
        e.preventDefault();
        var lines = prompt("What is the maximum amount of lines that you want your chat to show? Twitch default is 150. Leave the field blank to disable.", bttv.settings.get("scrollbackAmount"));
        if (lines != null && lines === "") {
            bttv.settings.save("scrollbackAmount", 150);
        } else if (lines != null && isNaN(lines) !== true && lines > 0) {
            bttv.settings.save("scrollbackAmount", parseInt(lines));
        } else {
            bttv.settings.save("scrollbackAmount", 150);
        }
    });
};
