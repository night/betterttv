var debug = require('../helpers/debug'),
    vars = require('../vars');

module.exports = function () {
    if(vars.emotesLoaded) return;

    debug.log("Loading BetterTTV Emoticons");

    var generate = function(data) {
        vars.emotesLoaded = true;

        data.emotes.forEach(function(emote, count) {
            emote.urlTemplate = data.urlTemplate.replace('{{id}}', emote.id);
            emote.url = emote.urlTemplate.replace('{{image}}', '1x');
            
            bttv.chat.store.bttvEmotes[emote.code] = emote;
        });

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
                        } else if($emote.data('channel') && $emote.data('channel') === 'BetterTTV Emotes') {
                            return "Emote: "+raw+"<br />BetterTTV Emoticon";
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
            if($emote.data('channel') && $emote.data('channel') === 'BetterTTV Emotes') return;
            
            if(bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                window.open('http://www.twitch.tv/'+bttv.TwitchEmoteIDToChannel[$emote.data('id')],'_blank');
            } else if($emote.data('channel')) {
                window.open('http://www.twitch.tv/'+$(this).data('channel'),'_blank');
            }
        });
    };

    $.getJSON('https://api.betterttv.net/2/emotes/ids').done(function(data) {
        bttv.TwitchEmoteIDToChannel = data.ids;
    });

    $.getJSON('https://api.betterttv.net/2/emotes/sets').done(function(data) {
        bttv.TwitchEmoteSets = data.sets;
    });

    $.getJSON('https://api.betterttv.net/2/emotes').done(function(data) {
        generate(data);
    });
};