var debug = require('../debug'),
    vars = require('../vars');

module.exports = function () {
    if(vars.emotesLoaded) return;

    debug.log("Overriding Twitch Emoticons");

    var generate = function(bttvEmotes) {
        vars.emotesLoaded = true;
        var cssString = "";

        /*var twitchDefaultEmotes = [
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

        var jtvDefaultEmotes = [
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

        var emoteController = (window.Ember && window.App) ? (App.__container__.lookup("controller:emoticons") || false) : false;
        var emoticonSets = emoteController ? emoteController.get('emoticonSets') : {};
        var emoticons = emoteController ? emoteController.get('emoticons') : [];

        var _id = 0;
        var getId = function() { return 'bttv-'+(_id++); };

        if(vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.login)) {
            var user = vars.userData.login;
            var userEmoteSets = bttv.chat.helpers.getEmotes(vars.userData.login);
        } else {
            var user = false;
        }
        var moragEmote = false;
        emoticons.forEach(function (emote) {
            if(emote.images) {
                emote.images.forEach(function (image) {
                    if(!image.url) return;
                    if(twitchDefaultEmotes.indexOf(image.url.replace("http://","https://")) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                        image.url = jtvDefaultEmotes[twitchDefaultEmotes.indexOf(image.url.replace("http://","https://"))];
                        image.height = 22;
                        image.width = 22;
                        cssString += bttv.chat.templates.emoticonCss(image, image.id);
                    }

                    if(user && userEmoteSets.indexOf(image.emoticon_set) !== -1) {
                        var prefixRegex = /^([a-z]+)([0-9A-Z][0-9A-Za-z]+)$/,
                            rawCommand = prefixRegex.exec(emote.regex);

                        if(rawCommand) {
                            if(/^[a-zA-Z0-9]{5,}$/.test(rawCommand[2])) {
                                bttv.chat.store.autoCompleteEmotes[rawCommand[2]] = rawCommand[1]+rawCommand[2];
                            }
                        }
                    }

                    if(emote.regex === "tehBUFR") {
                        moragEmote = image.id;
                    }
                });
            }
        });

        if (bttv.settings.get("bttvEmotes") !== false) {
            bttvEmotes.forEach(function (b) {
                var a = {};
                a.text = b.regex.replace(/\\/g,"").replace(/\((.*)\|(.*)\)/,"$1");
                b.regex.match(/^\w+$/) ? a.regex = new RegExp("\\b" + b.regex + "\\b", "g") : a.regex = new RegExp(b.regex, "g");
                a.channel = b.channel || "BetterTTV Emotes";
                a.badge = "//cdn.betterttv.net/tags/kappa.png";
                a.images = [];
                a.images.push({
                    emoticon_set: b.emoticon_set || null,
                    width: b.width,
                    height: b.height,
                    url: b.url
                });
                if(a.text === "SourPls") {
                    a.hidden = true;
                }
                if(b.restriction) {
                    if(b.restriction.channels && b.restriction.channels.indexOf(bttv.getChannel()) === -1) return;
                    if(b.restriction.games && b.restriction.games.indexOf(bttv.chat.tmi().channel.game) === -1) return;
                }
                if(b.channel === "Night" && user && userEmoteSets.indexOf('night') !== -1) {
                    a.hidden = false;
                }
                a.images.forEach(function (c) {
                    var id = getId();
                    cssString += bttv.chat.templates.emoticonCss(c, id);
                    var imageObject = {
                        cls: "emo-"+id,
                        isEmoticon: true,
                        regex: a.regex,
                    }
                    if(emoticonSets) {
                        if(c.emoticon_set) {
                          if(!emoticonSets[c.emoticon_set]) emoticonSets[c.emoticon_set] = [];
                          emoticonSets[c.emoticon_set].push(imageObject);
                        } else {
                          emoticonSets['default'].push(imageObject);
                        }
                    }
                });
                emoticons.push(a);
            });
        }*/

        $("body").on('mouseover', '.chat-line .emoticon', function() {
            vars.hoveringEmote = $(this);
            $(this).tipsy({
                trigger: 'manual',
                gravity: "se",
                live: false,
                html: true,
                fallback: function() {
                    var $emote = vars.hoveringEmote;
                    if($emote && $emote.data('regex')) {
                        var raw = decodeURIComponent($emote.data('regex'));
                        if(bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                            return "Emote: "+raw+"<br />Channel: "+bttv.TwitchEmoteIDToChannel[$emote.data('id')];
                        } else if($emote.data('channel')) {
                            return "Emote: "+raw+"<br />Channel: "+$emote.data('channel');
                        } else {
                            return raw;
                        }
                    } else {
                        return "Kappab"
                    }
                }
            });
            $(this).tipsy("show");
            var $emote = $(this);
            if(bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor','pointer');
            } else if($emote.data('channel')) {
                $(this).css('cursor','pointer');
            }
        }).on('mouseout', '.chat-line .emoticon', function() {
            $(this).tipsy("hide");
            var $emote = $(this);
            if(bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor','normal');
            } else if($emote.data('channel')) {
                $(this).css('cursor','normal');
            }
            $('div.tipsy').remove();
        }).on('click', '.chat-line .emoticon', function() {
            var $emote = $(this);
            if(bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                window.open('http://www.twitch.tv/'+bttv.TwitchEmoteIDToChannel[$emote.data('id')],'_blank');
            } else if($emote.data('channel')) {
                window.open('http://www.twitch.tv/'+$(this).data('channel'),'_blank');
            }
        });
        
        $('#bttvEmotes').remove();
        cssString += ".emoticon { display: inline-block; }";
        /*if(moragEmote !== false) {
            var spinner = "emo-"+moragEmote;
            cssString += '@keyframes "spinner"{from{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes spinner{from{-moz-transform:rotate(0);transform:rotate(0)}to{-moz-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes "spinner"{from{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-ms-keyframes "spinner"{from{-ms-transform:rotate(0);transform:rotate(0)}to{-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes "spinner"{from{-o-transform:rotate(0);transform:rotate(0)}to{-o-transform:rotate(360deg);transform:rotate(360deg)}}.spinner{-webkit-animation:spinner 1.5s linear infinite;-moz-animation:spinner 1.5s linear infinite;-ms-animation:spinner 1.5s linear infinite;-o-animation:spinner 1.5s linear infinite;animation:spinner 1.5s linear infinite}'.replace(/spinner/g, spinner);
        }*/
        var emoteCSS = document.createElement("style");
        emoteCSS.setAttribute("type", "text/css");
        emoteCSS.setAttribute("id", "bttvEmotes");
        emoteCSS.innerHTML = cssString;
        $('body').append(emoteCSS);
    };

    $.getJSON('https://cdn.betterttv.net/emotes/emotes.json?'+bttv.info.versionString()).done(function(emotes) {
        generate(emotes);
    }).fail(function() {
        generate([]);
    });
};