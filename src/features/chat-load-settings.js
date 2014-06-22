var debug = require('debug'),
    vars = require('vars');
var darkenPage = require('features/darken-page'),
    splitChat = require('features/split-chat');
var removeElement = require('element').remove;

module.exports = function() {
    if(!$('.ember-chat .chat-settings').length || $('.ember-chat .chat-settings .bttvChatSettings').length) return;

    debug.log("Loading BetterTTV Chat Settings");

    $('.ember-chat .chat-settings .clear-chat').remove();

    var settings = require('templates/chat-settings')();

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

    $('.flipDashboard').click(function(e) {
        e.preventDefault();
        if (bttv.settings.get("flipDashboard") === true) {
            bttv.settings.save("flipDashboard", false);
        } else {
            bttv.settings.save("flipDashboard", true);
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