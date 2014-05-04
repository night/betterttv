var debug = require('debug'),
    vars = require('vars');

module.exports = function () {
    if (vars.emotesLoaded) return;

    debug.log("Overriding Twitch Emoticons");

    var betterttvEmotes = [
        { url: "//cdn.betterttv.net/emotes/trollface.png", width: 23, height: 19, regex: "(\\:trollface\\:|\\:tf\\:)" },
        { url: "//cdn.betterttv.net/emotes/cry.png", width: 19, height: 19, regex: "\\:'\\(" },
        { url: "//cdn.betterttv.net/emotes/puke.png", width: 19, height: 19, regex: "\\(puke\\)" },
        { url: "//cdn.betterttv.net/emotes/mooning.png", width: 19, height: 19, regex: "\\(mooning\\)" },
        { url: "//cdn.betterttv.net/emotes/poolparty.png", width: 19, height: 19, regex: "\\(poolparty\\)" },
        { url: "//cdn.betterttv.net/emotes/kona.png", width: 25, height: 34, regex: "KKona" },
        { url: "//cdn.betterttv.net/emotes/foreveralone.png", width: 29, height: 30, regex: "ForeverAlone" },
        { url: "//cdn.betterttv.net/emotes/chez.png", width: 32, height: 35, regex: "TwaT" },
        { url: "//cdn.betterttv.net/emotes/black.png", width: 26, height: 30, regex: "RebeccaBlack" },
        { url: "//cdn.betterttv.net/emotes/rage.png", width: 33, height: 30, regex: "RageFace" },
        { url: "//cdn.betterttv.net/emotes/striker.png", width: 44, height: 35, regex: "rStrike" },
        { url: "//cdn.betterttv.net/emotes/chaccept.png", width: 23, height: 34, regex: "CHAccepted" },
        { url: "//cdn.betterttv.net/emotes/fuckyea.png", width: 45, height: 34, regex: "FuckYea" },
        { url: "//cdn.betterttv.net/emotes/namja.png", width: 37, height: 40, regex: "ManlyScreams" },
        { url: "//cdn.betterttv.net/emotes/pancakemix.png", width: 22, height: 30, regex: "PancakeMix" },
        { url: "//cdn.betterttv.net/emotes/pedobear.png", width: 32, height: 30, regex: "PedoBear" },
        { url: "//cdn.betterttv.net/emotes/genie.png", width: 25, height: 35, regex: "WatChuSay" },
        { url: "//cdn.betterttv.net/emotes/pedonam.png", width: 37, height: 40, regex: "PedoNam" },
        { url: "//cdn.betterttv.net/emotes/nam.png", width: 38, height: 40, regex: "NaM" },
        { url: "//cdn.betterttv.net/emotes/luda.png", width: 36, height: 34, regex: "LLuda" },
        { url: "//cdn.betterttv.net/emotes/updog.png", width: 32, height: 32, regex: "iDog" },
        { url: "//cdn.betterttv.net/emotes/blackhawk.png", width: 33, height: 34, regex: "iAMbh" },
        { url: "//cdn.betterttv.net/emotes/sdaw.png", width: 24, height: 34, regex: "ShoopDaWhoop" },
        { url: "//cdn.betterttv.net/emotes/hydro.png", width: 22, height: 34, regex: "HHydro" },
        { url: "//cdn.betterttv.net/emotes/chanz.png", width: 37, height: 40, regex: "OhGodchanZ" },
        { url: "//cdn.betterttv.net/emotes/ohgod.png", width: 31, height: 34, regex: "OhGod" },
        { url: "//cdn.betterttv.net/emotes/fapmeme.png", width: 35, height: 35, regex: "FapFapFap" },
        { url: "//cdn.betterttv.net/emotes/socal.png", width: 100, height: 40, regex: "iamsocal" },
        { url: "//cdn.betterttv.net/emotes/herbert.png", width: 29, height: 34, regex: "HerbPerve" },
        { url: "//cdn.betterttv.net/emotes/panda.png", width: 36, height: 40, regex: "SexPanda" },
        { url: "//cdn.betterttv.net/emotes/mandm.png", width: 36, height: 30, regex: "M&Mjc" },
        { url: "//cdn.betterttv.net/emotes/jokko.png", width: 23, height: 35, regex: "SwedSwag" },
        { url: "//cdn.betterttv.net/emotes/pokerface.png", width: 23, height: 35, regex: "PokerFace" },
        { url: "//cdn.betterttv.net/emotes/jamontoast.png", width: 33, height: 30, regex: "ToasTy" },
        { url: "//cdn.betterttv.net/emotes/basedgod.png", width: 33, height: 34, regex: "BasedGod" },
        { url: "//cdn.betterttv.net/emotes/fishmoley.png", width: 56, height: 34, regex: "FishMoley" },
        { url: "//cdn.betterttv.net/emotes/angry.png", width: 27, height: 35, regex: "cabbag3" },
        { url: "//cdn.betterttv.net/emotes/snatchy.png", width: 21, height: 35, regex: "OhhhKee" },
        { url: "//cdn.betterttv.net/emotes/sourpls.gif", width: 40, height: 40, regex: "SourPls" },
        { url: "//cdn.betterttv.net/emotes/stray.png", width: 45, height: 35, regex: "She'llBeRight" },
        { url: "//cdn.betterttv.net/emotes/taxi.png", width: 87, height: 30, regex: "TaxiBro" },
        { url: "//cdn.betterttv.net/emotes/cookiethump.png", width: 29, height: 25, regex: "CookieThump" },
        { url: "//cdn.betterttv.net/emotes/ohmygoodness.png", width: 20, height: 30, regex: "OhMyGoodness" },
        { url: "//cdn.betterttv.net/emotes/jesssaiyan.png", width: 20, height: 30, regex: "JessSaiyan" },
        { url: "//cdn.betterttv.net/emotes/yetiz.png", width: 60, height: 30, regex: "YetiZ" },
        { url: "//cdn.betterttv.net/emotes/urn.png", width: 19, height: 30, regex: "UrnCrown" },
        { url: "//cdn.betterttv.net/emotes/teh.png", width: 32, height: 20, regex: "tEh" },
        { url: "//cdn.betterttv.net/emotes/cobalt.png", width: 46, height: 30, regex: "BroBalt" },
        { url: "//cdn.betterttv.net/emotes/roll.png", width: 94, height: 20, regex: "RollIt!" },
        { url: "//cdn.betterttv.net/emotes/mmmbutter.png", width: 25, height: 23, regex: "ButterSauce" },
        { url: "//cdn.betterttv.net/emotes/baconeffect.png", width: 23, height: 28, regex: "BaconEffect" },
        { url: "//cdn.betterttv.net/emotes/yolk.png", width: 28, height: 25, regex: "WhatAYolk" },
        { url: "//cdn.betterttv.net/emotes/grip.png", width: 31, height: 30, regex: "CiGrip" },
        { url: "//cdn.betterttv.net/emotes/danish.png", width: 29, height: 25, regex: "aPliS" },
        { url: "//cdn.betterttv.net/emotes/datsauce.png", width: 32, height: 28, regex: "DatSauce" },
        { url: "//cdn.betterttv.net/emotes/doge.png", width: 25, height: 25, regex: "ConcernDoge" },
        { url: "//cdn.betterttv.net/emotes/hhehehe.png", width: 30, height: 21, regex: "Hhehehe" },
        { url: "//cdn.betterttv.net/emotes/suchcrream.png", width: 32, height: 32, regex: "SuchFraud" },
        { url: "//cdn.betterttv.net/emotes/vaughnrage.png", width: 32, height: 32, regex: "CandianRage" },
        { url: "//cdn.betterttv.net/emotes/parappakappa.png", width: 28, height: 28, regex: "KaRappa" },
        { url: "//cdn.betterttv.net/emotes/helix.png", width: 28, height: 28, regex: "HailHelix" },
        { url: "//cdn.betterttv.net/emotes/juliacs.png", width: 28, height: 28, regex: "JuliAwesome" },
        { url: "//cdn.betterttv.net/emotes/bttvnice.png", width: 42, height: 28, regex: "bttvNice" }
      ];

    if (bttv.settings.get("showDefaultEmotes") !== true) {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/aww.png",
            width: 19,
            height: 19,
            regex: "D\\:"
        });
    }

    if (bttv.getChannel() === "bacon_donut" || bttv.getChannel() === "straymav") {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/bacondance.gif",
            width: 72,
            height: 35,
            regex: "AwwwYeah"
        });
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/bacon.gif",
            width: 33,
            height: 35,
            regex: "BaconTime"
        });
    }

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/blackappa.png",
        width: 25,
        height: 28,
        regex: "Blackappa",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/aplis.png",
        width: 48,
        height: 28,
        regex: "aplis!",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/badass.png",
        width: 42,
        height: 28,
        regex: "BadAss",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/dogewitit.png",
        width: 28,
        height: 28,
        regex: "DogeWitIt",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/batkappa.png",
        width: 32,
        height: 32,
        regex: "BatKappa",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/soserious.png",
        width: 23,
        height: 30,
        regex: "SoSerious",
        channel: "Night",
        emoticon_set: "night"
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/kaged.png",
        width: 28,
        height: 28,
        regex: "Kaged",
        channel: "Night",
        emoticon_set: "night"
    });

    if(bttv.getChannel() === "night") {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/nightbanned.gif",
            width: 71,
            height: 30,
            regex: "BanAplis",
            channel: "Night",
            emoticon_set: "night"
        });
    }

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/blamen7.png",
        width: 24,
        height: 32,
        regex: "BlameN7",
        channel: "Blindfolded",
        emoticon_set: 1925
    });

    betterttvEmotes.push({
        url: "//cdn.betterttv.net/emotes/blindpls.gif",
        width: 28,
        height: 28,
        regex: "BlindPls",
        channel: "Blindfolded",
        emoticon_set: 1925
    });

    if(window.App && App.Channel && App.Channel.findOne(BetterTTV.getChannel()) && (App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Battlefield 4" || App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Battlefield 3")) {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/banned.gif",
            width: 53,
            height: 35,
            regex: "BanPls",
            channel: "Blindfolded",
            emoticon_set: 1925
        });
    }

    if(bttv.getChannel() === "ducksauce") {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/duckbutt.png",
            width: 28,
            height: 28,
            regex: "DuckButt",
            channel: "Ducksauce",
            emoticon_set: 94
        });
    }

    if(window.App && App.Channel && App.Channel.findOne(BetterTTV.getChannel()) && App.Channel.findOne(BetterTTV.getChannel()).get('game') === "Minecraft") {
        betterttvEmotes.push({
            url: "//cdn.betterttv.net/emotes/stick.gif",
            width: 30,
            height: 30,
            regex: "PunchStick",
            channel: "bacon_donut",
            emoticon_set: 172
        });
    }

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

    var emoteController = (window.Ember && window.App) ? (App.__container__.lookup("controller:emoticons") || false) : false;
    var emoticonSets = emoteController ? emoteController.get('emoticonSets') : {};
    var emoticons = emoteController ? emoteController.get('emoticons') : [];

    var _id = 0;
    var getId = function() { return 'bttv-'+(_id++); };

    vars.emotesLoaded = true;
    var cssString = "";
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
                if(oldEmotes.indexOf(image.url.replace("http://","https://")) !== -1 && bttv.settings.get("showDefaultEmotes") !== true) {
                    image.url = newEmotes[oldEmotes.indexOf(image.url.replace("http://","https://"))];
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

                /* For tehMorag, because I can */
                if(emote.regex === "tehBUFR") {
                    moragEmote = image.id;
                }
            });
        }
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
                emoticon_set: b.emoticon_set || null,
                width: b.width,
                height: b.height,
                url: b.url
            });
            if(a.text === "SourPls") {
                a.hidden = true;
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
    }
    $("body").on('mouseover', '.chat-line span.emoticon', function() {
        vars.hoveringEmote = $(this);
        $(this).tipsy({
            trigger: 'manual',
            gravity: "sw",
            live: false,
            html: true,
            fallback: function() {
                var $emote = vars.hoveringEmote;
                if($emote && $emote.data('regex')) {
                    var raw = decodeURIComponent($emote.data('regex').split(' ').join(''));
                    if($emote.data('channel')) {
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
        if($(this).data('channel')) {
            $(this).css('cursor','pointer');
        }
    }).on('mouseout', '.chat-line span.emoticon', function() {
        $(this).tipsy("hide");
        if($(this).data('channel')) {
            $(this).css('cursor','normal');
        }
        $('div.tipsy.tipsy-sw').remove();
    }).on('click', '.chat-line span.emoticon', function() {
        if($(this).data('channel')) {
            window.open('http://www.twitch.tv/'+$(this).data('channel'),'_blank');
        }
    });
    
    $('#bttvEmotes').remove();
    cssString += ".emoticon { display: inline-block; }";
    if(moragEmote !== false) {
        var spinner = "emo-"+moragEmote;
        cssString += '@keyframes "spinner"{from{-webkit-transform:rotate(0);-moz-transform:rotate(0);-o-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-moz-keyframes spinner{from{-moz-transform:rotate(0);transform:rotate(0)}to{-moz-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes "spinner"{from{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-ms-keyframes "spinner"{from{-ms-transform:rotate(0);transform:rotate(0)}to{-ms-transform:rotate(360deg);transform:rotate(360deg)}}@-o-keyframes "spinner"{from{-o-transform:rotate(0);transform:rotate(0)}to{-o-transform:rotate(360deg);transform:rotate(360deg)}}.spinner{-webkit-animation:spinner 1.5s linear infinite;-moz-animation:spinner 1.5s linear infinite;-ms-animation:spinner 1.5s linear infinite;-o-animation:spinner 1.5s linear infinite;animation:spinner 1.5s linear infinite}'.replace(/spinner/g, spinner);
    }
    var emoteCSS = document.createElement("style");
    emoteCSS.setAttribute("type", "text/css");
    emoteCSS.setAttribute("id", "bttvEmotes");
    emoteCSS.innerHTML = cssString;
    $('body').append(emoteCSS);
};