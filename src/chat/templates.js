var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers');

var badge = exports.badge = function(type, name, description) {
    return '<div class="' + type + '' + ((bttv.settings.get('alphaTags') && ['admin', 'global-moderator', 'staff', 'broadcaster', 'moderator', 'turbo', 'ign'].indexOf(type) !== -1) ? ' alpha' + (!bttv.settings.get('darkenedMode') ? ' invert' : '') : '') + ' badge" title="' + description + '">' + name + '</div> ';
};

var badges = exports.badges = function(badgeList) {
    var resp = '<span class="badges">';
    badgeList.forEach(function(data) {
        resp += badge(data.type, data.name, data.description);
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

var escapeEmoteCode = function(code) {
    return code.replace(/('|"|>|<|&)/g, '');
};

var emoticonBTTV = exports.emoticonBTTV = function(emote) {
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

var bttvEmoticonize = exports.bttvEmoticonize = function(message, emote, sender) {
    if (emote.restrictions) {
        if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return message;
        if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return message;

        var emoteSets = sender ? helpers.getEmotes(sender) : [];
        if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return message;
    }

    return message.replace(emote.code, emoticonBTTV(emote));
};

var bttvMessageTokenize = exports.bttvMessageTokenize = function(sender, message) {
    var tokenizedString = message.split(' ');

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

        if (store.bttvEmotes.hasOwnProperty(piece)) {
            emote = store.bttvEmotes[piece];
        } else if (store.bttvEmotes.hasOwnProperty(test)) {
            emote = store.bttvEmotes[test];
        } else if (store.proEmotes.hasOwnProperty(sender)) {
            if (store.proEmotes[sender].hasOwnProperty(piece)) {
                emote = store.proEmotes[sender][piece];
            } else if (store.proEmotes[sender].hasOwnProperty(test)) {
                emote = store.proEmotes[sender][test];
            }
        }

        if (
            emote &&
            emote.urlTemplate &&
            bttv.settings.get('bttvEmotes') === true &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            piece = bttvEmoticonize(piece, emote, sender);
        } else {
            piece = escape(piece);
            piece = linkify(piece);
        }

        tokenizedString[i] = piece;
    }

    return tokenizedString.join(' ');
};

exports.moderationCard = function(user, top, left) {
    var moderationCardTemplate = require('../templates/moderation-card');
    return moderationCardTemplate({user: user, top: top, left: left});
};

exports.suggestions = function(suggestions, index) {
    var suggestionsTemplate = require('../templates/chat-suggestions');
    return suggestionsTemplate({suggestions: suggestions, index: index});
};

var message = exports.message = function(sender, msg, emotes, colored, force) {
    colored = colored || false;
    force = force || false;
    var rawMessage = encodeURIComponent(msg);

    if (sender !== 'jtv') {
        var tokenizedMessage = emoticonize(msg, emotes);

        for (var i = 0; i < tokenizedMessage.length; i++) {
            if (typeof tokenizedMessage[i] === 'string') {
                tokenizedMessage[i] = bttvMessageTokenize(sender, tokenizedMessage[i]);
            } else {
                tokenizedMessage[i] = tokenizedMessage[i][0];
            }
        }

        msg = tokenizedMessage.join(' ');
    }

    var spam = false;
    if (bttv.settings.get('hideSpam') && helpers.isSpammer(sender) && !helpers.isModerator(sender) && !force) {
        msg = '<span style="color: #999">&lt;spam deleted&gt;</span>';
        spam = true;
    }

    return '<span class="message ' + (spam ? 'spam' : '') + '" ' + (colored ? 'style="color: ' + colored + '" ' : '') + 'data-raw="' + rawMessage + '" data-emotes="' + (emotes ? encodeURIComponent(JSON.stringify(emotes)) : 'false') + '">' + msg + '</span>';
};

exports.privmsg = function(highlight, action, server, isMod, data) {
    return '<div class="chat-line' + (highlight ? ' highlight' : '') + (action ? ' action' : '') + (server ? ' admin' : '') + '" data-sender="' + data.sender + '">' + timestamp(data.time) + ' ' + (isMod ? modicons() : '') + ' ' + badges(data.badges) + from(data.nickname, data.color) + message(data.sender, data.message, data.emotes, (action && !highlight) ? data.color : false) + '</div>';
};

var whisperName = exports.whisperName = function(sender, receiver, fromNick, to, fromColor, toColor) {
    return '<span style="color: ' + fromColor + ';" class="from" data-sender="' + sender + '">' + escape(fromNick) + '</span><svg class="svg-whisper-arrow" height="10px" version="1.1" width="16px"><polyline points="6 2, 10 6, 6 10, 6 2"></polyline></svg><span style="color: ' + toColor + ';" class="from" data-sender="' + receiver + '">' + escape(to) + '</span><span class="colon">:</span>&nbsp;<wbr></wbr>';
};

exports.whisper = function(data) {
    return '<div class="chat-line whisper" data-sender="' + data.sender + '">' + timestamp(data.time) + ' ' + whisperName(data.sender, data.receiver, data.from, data.to, data.fromColor, data.toColor) + message(data.sender, data.message, data.emotes, false) + '</div>';
};
