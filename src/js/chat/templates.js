var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers'),
    twemoji = require('twemoji'),
    regexUtils = require('../helpers/regex'),
    blacklistedEmoji = require('../helpers/emoji-blacklist.json');

var badge = exports.badge = function(type, name, description, action) {
    var classes = type + '' + ((bttv.settings.get('alphaTags') && ['admin', 'global-moderator', 'staff', 'broadcaster', 'moderator', 'turbo', 'ign'].indexOf(type) !== -1) ? ' alpha' + (!bttv.settings.get('darkenedMode') ? ' invert' : '') : '') + ' badge';
    return '<div class="' + classes + '" title="' + description + '"' + (action ? ' data-click-action="' + action + '"' : '') + '>' + name + '</div> ';
};

var badges = exports.badges = function(badgeList) {
    var resp = '<span class="badges">';
    badgeList.forEach(function(data) {
        resp += badge(data.type, data.name, data.description, data.clickAction);
    });
    resp += '</span>';
    return resp;
};

var escape = exports.escape = function(message) {
    return message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

var from = exports.from = function(name, color) {
    return '<span ' + (color ? 'style="color: ' + color + ';" ' : '') + 'class="from">' + escape(name) + '</span><span class="colon">:</span>' + (name !== 'jtv' ? '&nbsp;<wbr></wbr>' : '');
};

var timestamp = exports.timestamp = function(time) {
    return '<span class="timestamp"><small>' + time + '</small></span>';
};

var modicons = exports.modicons = function() {
    return '<span class="mod-icons"><a class="mod-icon ban" title="Ban">Ban</a><a class="mod-icon unban" title="Unban" style="display: none;">Unban</a><a class="mod-icon timeout" title="Timeout">Timeout</a></span>';
};

var linkify = exports.linkify = function(message) {
    var regex = /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_\+~#=]+\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=()]*)/gi;
    return message.replace(regex, function(e) {
        if (/\x02/.test(e)) return e;
        if (e.indexOf('@') > -1 && (e.indexOf('/') === -1 || e.indexOf('@') < e.indexOf('/'))) return '<a href="mailto:' + e + '">' + e + '</a>';
        var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
        return '<a href="' + link + '" target="_blank">' + e + '</a>';
    });
};

var userMentions = exports.userMentions = function(message) {
    if (message.substring(0, 1) === '@' && message.length >= 2) {
        username = message.substring(1);
        if (username.substring(username.length - 1) === ',') {
            username = username.slice(0, -1);
        }
        if (username !== '' && Object.hasOwnProperty.call(store.chatters, username.toLowerCase())) {
            return message.replace('@' + username, '<span class="user-mention">@' + username + '</span>');
        }
    }
    return message;
};

var bitsEmoticonize = function(config, value) {
    var tier;
    for (var i = config.tiers.length - 1; i >= 0; i--) {
        tier = config.tiers[i];
        if (tier.min_bits <= value) break;
    }

    var url = 'https://static-cdn.jtvnw.net/bits/' + (bttv.settings.get('darkenedMode') ? 'dark' : 'light') + '/animated/' + tier.image;
    var emote = '<img class="chatline__bit" alt="cheer" src="' + url + '/1" srcset="' + url + '/1.5 1.5x, ' + url + '/2 2x, ' + url + '/3 3x, ' + url + '/4 4x">';
    return emote + '<strong><span class="bitsText" style="color: ' + tier.color + '">' + value + '</span></strong>';
};


var parseBits = function(piece, amount) {
    if (amount && helpers.containsCheer(piece)) {
        if (bttv.settings.get('hideBits') === true) return '';

        var config = helpers.getBitsConfig();
        if (!config) return piece;

        var value = parseInt(piece.match(/\d+/), 10);
        piece = bitsEmoticonize(config, value);
    }
    return piece;
};

var escapeEmoteCode = function(code) {
    return escape(code.replace(/('|"|&)/g, ''));
};

var emoticonBTTV = exports.emoticonBTTV = function(emote) {
    if (!emote.urlTemplate) return emote.code;

    var channel = emote.channel ? 'data-channel="' + emote.channel + '" ' : '';
    var type = emote.type ? 'data-type="' + emote.type + '" ' : '';
    return '<img class="emoticon bttv-emo-' + emote.id + '" src="' + emote.urlTemplate.replace('{{image}}', '1x') + '" srcset="' + emote.urlTemplate.replace('{{image}}', '2x') + ' 2x" ' + type + channel + 'alt="' + escapeEmoteCode(emote.code) + '" />';
};

var jtvEmoticonize = exports.jtvEmoticonize = function(id) {
    var jtvEmotes = [
        'https://cdn.betterttv.net/emotes/jtv/happy.gif',
        'https://cdn.betterttv.net/emotes/jtv/sad.gif',
        'https://cdn.betterttv.net/emotes/mw.png',
        'https://cdn.betterttv.net/emotes/jtv/angry.gif',
        'https://cdn.betterttv.net/emotes/jtv/bored.gif',
        'https://cdn.betterttv.net/emotes/jtv/drunk.gif',
        'https://cdn.betterttv.net/emotes/jtv/cool.gif',
        'https://cdn.betterttv.net/emotes/jtv/surprised.gif',
        'https://cdn.betterttv.net/emotes/jtv/horny.gif',
        'https://cdn.betterttv.net/emotes/jtv/skeptical.gif',
        'https://cdn.betterttv.net/emotes/jtv/wink.gif',
        'https://cdn.betterttv.net/emotes/jtv/raspberry.gif',
        'https://cdn.betterttv.net/emotes/jtv/winkberry.gif',
        'https://cdn.betterttv.net/emotes/jtv/pirate.gif'
    ];

    return jtvEmotes[id - 1];
};

var emoticon = exports.emoticon = function(id, name) {
    var fixedTwitchEmotes = [15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 33];

    if (fixedTwitchEmotes.indexOf(parseInt(id, 10)) > -1) {
        return '<img class="emoticon ttv-emo-' + id + ' "src="https://cdn.betterttv.net/emotes/twitch_fixed/' + id + '_1x.png" srcset="https://cdn.betterttv.net/emotes/twitch_fixed/' + id + '_2x.png 2x" data-id="' + id + '" alt="' + escapeEmoteCode(name) + '" />';
    }
    if (id < 15 && bttv.settings.get('showMonkeyEmotes') === true) {
        return '<img class="emoticon ttv-emo-' + id + '" src="' + jtvEmoticonize(id) + '" data-id="' + id + '" alt="' + escapeEmoteCode(name) + '" />';
    }
    return '<img class="emoticon ttv-emo-' + id + '" src="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x" data-id="' + id + '" alt="' + escapeEmoteCode(name) + '" />';
};

exports.emoticonCss = function(image, id) {
    var css = '';
    if (image.height > 18) css = 'margin: -' + (image.height - 18) / 2 + 'px 0px';
    return '.emo-' + id + ' {' + 'background-image: url("' + image.url + '");' + 'height: ' + image.height + 'px;' + 'width: ' + image.width + 'px;' + css + '}';
};

var emoticonize = exports.emoticonize = function(message, emotes) {
    if (!emotes) return [message];

    var tokenizedMessage = [];
    var replacements = [];

    Object.keys(emotes).forEach(function(id) {
        var emote = emotes[id];

        for (var i = emote.length - 1; i >= 0; i--) {
            replacements.push({ id: id, first: emote[i][0], last: emote[i][1] });
        }
    });

    replacements.sort(function(a, b) {
        return b.first - a.first;
    });

    replacements.forEach(function(replacement) {
        // The emote command
        var name = message.slice(replacement.first, replacement.last + 1);

        // Unshift the end of the message (that doesn't contain the emote)
        tokenizedMessage.unshift(message.slice(replacement.last + 1));

        // Unshift the emote HTML (but not as a string to allow us to process links and escape html still)
        tokenizedMessage.unshift([ emoticon(replacement.id, name) ]);

        // Splice the unparsed piece of the message
        message = message.slice(0, replacement.first);
    });

    // Unshift the remaining part of the message (that contains no emotes)
    tokenizedMessage.unshift(message);

    return tokenizedMessage;
};

var parseEmoji = function(piece) {
    return twemoji.parse(piece, {
        callback: function(icon, options) {
            switch (icon) {
                case 'a9': // ©
                case 'ae': // ®
                case '2122': // ™
                    return false;
            }
            return ''.concat(options.base, options.size, '/', icon, options.ext);
        },
        attributes: function() {
            return {
                'data-type': 'emoji'
            };
        }
    });
};

var bttvEmoticonize = exports.bttvEmoticonize = function(message, emote, sender) {
    if (emote.restrictions) {
        if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return message;
        if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return message;

        var emoteSets = sender ? helpers.getEmotes(sender) : [];
        if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return message;
    }

    return message.replace(emote.code, emote.type === 'emoji' ? parseEmoji(message) : emoticonBTTV(emote));
};

var bttvMessageTokenize = exports.bttvMessageTokenize = function(sender, message, bits) {
    // filter blacklisted emojis
    blacklistedEmoji.forEach(function(emoji) {
        message = regexUtils.stripAll(message, emoji);
    });

    var tokenizedString = message.trim().split(' ');

    for (var i = 0; i < tokenizedString.length; i++) {
        var piece = tokenizedString[i];

        if (bttv.settings.get('chatImagePreview') === true) {
            var imageTest = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv|webm))', 'i');
            if (imageTest.test(piece)) {
                piece = bttv.chat.imagePreview(piece);
                tokenizedString[i] = piece;
                continue;
            }
        }

        var test = piece.replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        var emote = null;

        if (Object.hasOwnProperty.call(store.bttvEmotes, piece)) {
            emote = store.bttvEmotes[piece];
        } else if (Object.hasOwnProperty.call(store.bttvEmotes, test)) {
            emote = store.bttvEmotes[test];
        } else if (Object.hasOwnProperty.call(store.proEmotes, sender)) {
            if (Object.hasOwnProperty.call(store.proEmotes[sender], piece)) {
                emote = store.proEmotes[sender][piece];
            } else if (Object.hasOwnProperty.call(store.proEmotes[sender], test)) {
                emote = store.proEmotes[sender][test];
            }
        }

        if (
            emote &&
            bttv.settings.get('bttvEmotes') === true &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            piece = bttvEmoticonize(piece, emote, sender);
        } else {
            // escape is always first, otherwise you're going to
            // create a security vuln..
            piece = escape(piece);

            // parse only one of the replacers, otherwise you're going to
            // create a security vuln..
            var pieceReplacements = [linkify, userMentions, parseBits, parseEmoji];
            var newPiece;
            for (var j = 0; j < pieceReplacements.length; j++) {
                newPiece = pieceReplacements[j](piece, bits);

                if (piece !== newPiece) {
                    piece = newPiece;
                    break;
                }
            }
        }

        tokenizedString[i] = piece;
    }

    return tokenizedString.join(' ');
};

var getEmoteId = function($emote) {
    if ($emote.data('id')) return $emote.data('id');

    var src = $emote.attr('src');

    if (!src) return null;

    src = /^\/\/static-cdn.jtvnw.net\/emoticons\/v1\/([0-9]+)/.exec(src);

    return src ? src[1] : null;
};

exports.bttvElementTokenize = function(senderEl, messageEl) {
    var newTokens = [];
    var tokens = $(messageEl).contents();
    var sender = $(senderEl).text().trim().toLowerCase();

    if (!store.chatters[sender]) store.chatters[sender] = {lastWhisper: 0};

    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].nodeType === window.Node.TEXT_NODE) {
            newTokens.push(bttvMessageTokenize(sender, tokens[i].data));
        } else if (tokens[i].nodeType === window.Node.ELEMENT_NODE && $(tokens[i]).children('.emoticon').length) {
            // this remakes Twitch's emoticon because they steal on-hover in ember-bound elements
            var $emote = $(tokens[i]).children('.emoticon');
            newTokens.push(emoticon(getEmoteId($emote), $emote.attr('alt')));
        } else {
            newTokens.push(tokens[i].outerHTML);
        }
    }

    return newTokens.join(' ');
};

exports.moderationCard = function(user, top, left) {
    var moderationCardTemplate = require('../../templates/moderation-card');
    return moderationCardTemplate({user: user, top: top, left: left});
};

exports.suggestions = function(suggestions, index) {
    var suggestionsTemplate = require('../../templates/chat-suggestions');
    return suggestionsTemplate({suggestions: suggestions, index: index});
};

var message = exports.message = function(sender, msg, data) {
    data = data || {};
    var emotes = data.emotes;
    var colored = data.colored;
    var bits = data.bits;
    var rawMessage = encodeURIComponent(msg);

    if (sender !== 'jtv') {
        var tokenizedMessage = emoticonize(msg, data.emotes);
        for (var i = 0; i < tokenizedMessage.length; i++) {
            if (typeof tokenizedMessage[i] === 'string') {
                tokenizedMessage[i] = bttvMessageTokenize(sender, tokenizedMessage[i], bits);
            } else {
                tokenizedMessage[i] = tokenizedMessage[i][0];
            }
        }

        msg = tokenizedMessage.join(' ');
    }

    var spam = false;
    if (bttv.settings.get('hideSpam') && helpers.isSpammer(sender) && !helpers.isModerator(sender) && !data.forced) {
        msg = '<span class="deleted">&lt;spam deleted&gt;</span>';
        spam = true;
    }

    return '<span class="message ' + (spam ? 'spam' : '') + '" ' + (colored ? 'style="color: ' + colored + '" ' : '') + 'data-raw="' + rawMessage + '" data-bits="' + (bits ? encodeURIComponent(JSON.stringify(bits)) : 'false') + '" data-emotes="' + (emotes ? encodeURIComponent(JSON.stringify(emotes)) : 'false') + '">' + msg + '</span>';
};

exports.privmsg = function(data, opts) {
    opts = opts || {};
    var msgOptions = {emotes: data.emotes, colored: (opts.action && !opts.highlight) ? data.color : false, bits: data.bits};
    var msg = timestamp(data.time) + ' ' + (opts.isMod ? modicons() : '') + ' ' + badges(data.badges) + from(data.nickname, data.color) + message(data.sender, data.message, msgOptions);
    return '<div class="chat-line' + (opts.highlight ? ' highlight' : '') + (opts.action ? ' action' : '') + (opts.server ? ' admin' : '') + (opts.notice ? ' notice' : '') + '" data-sender="' + data.sender + '">' + msg + '</div>';
};

var whisperName = exports.whisperName = function(sender, receiver, fromNick, to, fromColor, toColor) {
    return '<span style="color: ' + fromColor + ';" class="from" data-sender="' + sender + '">' + escape(fromNick) + '</span><svg class="svg-whisper-arrow" height="10px" version="1.1" width="16px"><polyline points="6 2, 10 6, 6 10, 6 2"></polyline></svg><span style="color: ' + toColor + ';" class="from" data-sender="' + receiver + '">' + escape(to) + '</span><span class="colon">:</span>&nbsp;<wbr></wbr>';
};

exports.whisper = function(data) {
    return '<div class="chat-line whisper" data-sender="' + data.sender + '">' + timestamp(data.time) + ' ' + whisperName(data.sender, data.receiver, data.from, data.to, data.fromColor, data.toColor) + message(data.sender, data.message, {emotes: data.emotes, colored: false}) + '</div>';
};
