var debug = require('../helpers/debug'),
    templates = require('../chat/templates'),
    vars = require('../vars'),
    emojilib = require('emojilib'),
    blacklistedEmoji = require('../helpers/emoji-blacklist.json');

module.exports = function() {
    if (vars.emotesLoaded) return;

    debug.log('Loading BetterTTV Emoticons');

    var generate = function(data) {
        vars.emotesLoaded = true;

        if ('emotes' in data) {
            data.emotes.forEach(function(emote) {
                emote.urlTemplate = data.urlTemplate.replace('{{id}}', emote.id);
                emote.url = emote.urlTemplate.replace('{{image}}', '1x');
                emote.type = 'global';

                bttv.chat.store.bttvEmotes[emote.code] = emote;
            });
        }

        if ('emojis' in data) {
            data.emojis.forEach(function(emoji) {
                emoji.type = 'emoji';

                bttv.chat.store.bttvEmotes[emoji.code] = emoji;
            });
        }

        $('body').on('mouseover', '.chat-line .emoticon, .chat-line .emoji', function() {
            vars.hoveringEmote = $(this);
            $(this).tipsy({
                trigger: 'manual',
                gravity: 'se',
                live: false,
                html: true,
                fallback: function() {
                    var $emote = vars.hoveringEmote;
                    if ($emote && $emote.attr('alt')) {
                        var raw = templates.escape($emote.attr('alt'));
                        if ($emote.data('type') === 'emoji') {
                            var emoji = Object.keys(emojilib.lib).find(function(key) {
                                return emojilib.lib[key].char === raw;
                            });
                            if (emoji) raw = ':' + emoji + ':';
                        }
                        if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                            return 'Emote: ' + raw + '<br />Channel: ' + bttv.TwitchEmoteIDToChannel[$emote.data('id')];
                        } else if (!$emote.data('channel') && $emote.data('type')) {
                            return 'Emote: ' + raw + '<br />BetterTTV ' + $emote.data('type').capitalize() + ' Emote';
                        } else if ($emote.data('channel')) {
                            return 'Emote: ' + raw + '<br />Channel: ' + $emote.data('channel') + '<br />BetterTTV ' + $emote.data('type').capitalize() + ' Emote';
                        } else {
                            return raw;
                        }
                    } else {
                        return 'Kappab';
                    }
                }
            });
            $(this).tipsy('show');
            var $emote = $(this);
            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor', 'pointer');
            } else if ($emote.data('channel')) {
                $(this).css('cursor', 'pointer');
            }
        }).on('mouseout', '.chat-line .emoticon, .chat-line .emoji', function() {
            $(this).tipsy('hide');
            var $emote = $(this);
            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                $(this).css('cursor', 'normal');
            } else if ($emote.data('channel')) {
                $(this).css('cursor', 'normal');
            }
            $('div.tipsy').remove();
        }).on('click', '.chat-line .emoticon, .chat-line .emoji', function() {
            var $emote = $(this);

            if (bttv.TwitchEmoteIDToChannel && $emote.data('id') && bttv.TwitchEmoteIDToChannel[$emote.data('id')]) {
                window.open('http://www.twitch.tv/' + bttv.TwitchEmoteIDToChannel[$emote.data('id')], '_blank');
            } else if ($emote.data('channel')) {
                window.open('http://www.twitch.tv/' + $(this).data('channel'), '_blank');
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
        data.emojis = Object.keys(emojilib.lib).filter(function(key) {
            return blacklistedEmoji.indexOf(emojilib.lib[key].char) === -1 && emojilib.lib[key].category !== '_custom';
        }).map(function(key) {
            return {
                code: ':' + key + ':',
                char: emojilib.lib[key].char,
                imageType: 'png',
                channel: null,
                id: 'emoji_' + key
            };
        });

        generate(data);
    });
};
