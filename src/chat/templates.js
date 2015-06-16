var tmi = require('./tmi'),
    store = require('./store');

var badge = exports.badge = function(type, name, description) {
    return '<div class="'+type+''+((bttv.settings.get('alphaTags') && ['admin','global-moderator','staff','broadcaster','moderator','turbo','ign'].indexOf(type) !== -1)?' alpha'+(!bttv.settings.get("darkenedMode")?' invert':''):'')+' badge" title="'+description+'">'+name+'</div> ';
};
var badges = exports.badges = function(badges) {
    var resp = '<span class="badges">';
    badges.forEach(function(data) {
        resp += badge(data.type, data.name, data.description);
    });
    resp += '</span>';
    return resp;
};
var from = exports.from = function(name, color) {
    return '<span '+(color?'style="color: '+color+';" ':'')+'class="from">'+escape(bttv.storage.getObject("nicknames")[name.toLowerCase()] || name)+'</span><span class="colon">:</span>'+(name!=='jtv'?'&nbsp;<wbr></wbr>':'');
};
var timestamp = exports.timestamp = function(time) {
    return '<span class="timestamp"><small>'+time+'</small></span>';
};
var modicons = exports.modicons = function() {
    return '<span class="mod-icons"><a class="timeout" title="Timeout">Timeout</a><a class="ban" title="Ban">Ban</a><a class="unban" title="Unban" style="display: none;">Unban</a></span>';
};
var escape = exports.escape = function(message) {
    return message.replace(/</g,'&lt;').replace(/>/g, '&gt;');
};
var linkify = exports.linkify = function(message) {
    var regex = /(?:https?:\/\/)?(?:[-a-zA-Z0-9@:%_\+~#=]+\.)+[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/=]*)/gi;
    return message.replace(regex, function(e) {
        if (/\x02/.test(e)) return e;
        if (e.indexOf("@") > -1 && (e.indexOf("/") === -1 || e.indexOf("@") < e.indexOf("/"))) return '<a href="mailto:' + e + '">' + e + "</a>";
        var link = e.replace(/^(?!(?:https?:\/\/|mailto:))/i, 'http://');
        return '<a href="' + link + '" target="_blank">' + e + '</a>';
    });
};
var emoticonBTTV = exports.emoticonBTTV = function(emote) {
    var channel = emote.channel ? 'data-channel="' + emote.channel + '" ' : '';
    return '<img class="emoticon bttv-emo-' + emote.id + '" src="' + emote.urlTemplate.replace('{{image}}','1x') + '" srcset="' + emote.urlTemplate.replace('{{image}}','2x') + ' 2x" ' + channel + 'data-regex="' + encodeURIComponent(emote.code) + '" />';
};
var emoticon = exports.emoticon = function(id, name) {
    if(id < 15 && bttv.settings.get("showMonkeyEmotes") === true) {
        return '<img class="emoticon ttv-emo-' + id + '" src="' + jtvEmoticonize(id) + '" data-id="' + id + '" data-regex="' + encodeURIComponent(name) + '" />';
    } else {
        return '<img class="emoticon ttv-emo-' + id + '" src="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/' + id + '/2.0 2x" data-id="' + id + '" data-regex="' + encodeURIComponent(name) + '" />';
    }
};
var emoticonCss = exports.emoticonCss = function(image, id) {
    var css = "";
    if(image.height > 18) css = "margin: -" + (image.height-18)/2 + "px 0px";
    return ".emo-"+id+" {"+'background-image: url("'+image.url+'");'+"height: "+image.height+"px;"+"width: "+image.width+"px;"+css+"}";
};
var jtvEmoticonize = exports.jtvEmoticonize = function(id) {
    var jtvEmotes = [
        "https://cdn.betterttv.net/emotes/jtv/happy.gif",
        "https://cdn.betterttv.net/emotes/jtv/sad.gif",
        "https://cdn.betterttv.net/emotes/mw.png",
        "https://cdn.betterttv.net/emotes/jtv/angry.gif",
        "https://cdn.betterttv.net/emotes/jtv/bored.gif",
        "https://cdn.betterttv.net/emotes/jtv/drunk.gif",
        "https://cdn.betterttv.net/emotes/jtv/cool.gif",
        "https://cdn.betterttv.net/emotes/jtv/surprised.gif",
        "https://cdn.betterttv.net/emotes/jtv/horny.gif",
        "https://cdn.betterttv.net/emotes/jtv/skeptical.gif",
        "https://cdn.betterttv.net/emotes/jtv/wink.gif",
        "https://cdn.betterttv.net/emotes/jtv/raspberry.gif",
        "https://cdn.betterttv.net/emotes/jtv/winkberry.gif",
        "https://cdn.betterttv.net/emotes/jtv/pirate.gif"
    ];

    return jtvEmotes[id-1];
};
var emoticonize = exports.emoticonize = function(message, emotes) {
    if(!emotes) return [message];

    var tokenizedMessage = [];
    var replacements = [];

    Object.keys(emotes).forEach(function(id) {
        var emote = emotes[id];

        for(var i=emote.length-1; i>=0; i--) {
            replacements.push({ id: id, first: emote[i][0], last: emote[i][1] });
        }
    });

    replacements.sort(function(a, b) {
        return b.first - a.first;
    });

    replacements.forEach(function(replacement) {
        // The emote command
        var name = message.slice(replacement.first, replacement.last+1);

        // Unshift the end of the message (that doesn't contain the emote)
        tokenizedMessage.unshift(message.slice(replacement.last+1));

        // Unshift the emote HTML (but not as a string to allow us to process links and escape html still)
        tokenizedMessage.unshift([ emoticon(replacement.id, name) ]);

        // Splice the unparsed piece of the message
        message = message.slice(0, replacement.first);
    });

    // Unshift the remaining part of the message (that contains no emotes)
    tokenizedMessage.unshift(message);

    return tokenizedMessage;
};
var bttvEmoticonize = exports.bttvEmoticonize = function(sender, message, emote) {
    if(emote.restrictions) {
        if(emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return message;
        if(emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return message;

        var emoteSets = require('./helpers').getEmotes(sender);
        if(emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return message;
    }

    return message.replace(emote.code, emoticonBTTV(emote));
};
var bttvMessageTokenize = exports.bttvMessageTokenize = function(sender, message) {
    var tokenizedString = message.split(' ');

    for(var i=0; i<tokenizedString.length; i++) {
        var piece = tokenizedString[i];

        if(bttv.settings.get('chatImagePreview') === true) {
            var imageTest = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif))', 'i');
            if (imageTest.test(piece)) {
                piece = bttv.chat.imagePreview(piece);
                tokenizedString[i] = piece;
                continue;
            }
        }

        if(bttv.settings.get('linkInfo') === true) {
            var match;
            if (match = /((?:https?:\/\/)?(?:youtu\.be\/|(?:www\.)?youtube\.com\/(?:watch\?v|playlist\?list)=)[-a-zA-Z0-9_]+)[-a-zA-Z0-9@:%_\+.~#?&\/=]*/i.exec(piece)) {
                piece = escape(piece);
                var link = piece.replace(/^(?!(?:https?:\/\/))/i, 'http://'),
                    link2 = match[1].replace(/^(?!(?:https?:\/\/))/i, 'http://');
                piece = '<a href="' + link + '" target="_blank" class="info-link" link-type="youtube" link-data="' + encodeURIComponent(link2) + '">' + piece + '</a>';
                tokenizedString[i] = piece;
                continue;
            }
            else if (match = /((?:https?:\/\/)?(?:www\.)?(?:bit\.ly|goo\.gl|ow\.ly|t\.co|tinyurl\.com|tr\.im)\/[-a-zA-Z0-9_]+)[-a-zA-Z0-9@:%_\+.~#?&\/=]*/i.exec(piece)) {
                piece = escape(piece);
                var link = piece.replace(/^(?!(?:https?:\/\/))/i, 'http://'),
                    link2 = match[1].replace(/^(?!(?:https?:\/\/))/i, 'http://');
                piece = '<a href="' + link + '" target="_blank" class="info-link" link-type="tiny" link-data="' + encodeURIComponent(link2) + '">' + piece + '</a>';
                tokenizedString[i] = piece;
                continue;
            }
            else if (match = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([-a-zA-Z0-9_]+)(?:\/[-a-zA-Z0-9@:%_\+.~#?&\/=]*)?/i.exec(piece)) {
                piece = escape(piece);
                var link = piece.replace(/^(?!(?:https?:\/\/))/i, 'http://'),
                    link2 = match[1];
                if ('directory following settings login logout'.indexOf(link2) !== -1) piece = '<a href="' + link + '" target="_blank">' + piece + '</a>';
                else piece = '<a href="' + link + '" target="_blank" class="info-link" link-type="twitch" link-data="' + encodeURIComponent(link2) + '">' + piece + '</a>';
                tokenizedString[i] = piece;
                continue;
            }
        }

        var test = piece.replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        var emote = null;

        if(store.bttvEmotes.hasOwnProperty(piece)) {
            emote = store.bttvEmotes[piece];
        } else if(store.bttvEmotes.hasOwnProperty(test)) {
            emote = store.bttvEmotes[test];
        }

        if(emote && emote.urlTemplate && bttv.settings.get("bttvEmotes") === true) {
            piece = bttvEmoticonize(sender, piece, emote);
        } else {
            piece = escape(piece);
            piece = linkify(piece);
        }

        tokenizedString[i] = piece;
    }

    return tokenizedString.join(' ');
};
var moderationCard = exports.moderationCard = function(user, top, left) {
    var moderationCardTemplate = require('../templates/moderation-card');
    return moderationCardTemplate({user: user, top: top, left: left});
};
var suggestions = exports.suggestions = function(suggestions, index) {
    var suggestionsTemplate = require('../templates/chat-suggestions');
    return suggestionsTemplate({suggestions: suggestions, index: index});
};
var message = exports.message = function(sender, message, emotes, colored) {
    colored = colored || false;
    var rawMessage = encodeURIComponent(message);

    if(sender !== 'jtv') {
        var tokenizedMessage = emoticonize(message, emotes);

        for(var i=0; i<tokenizedMessage.length; i++) {
            if(typeof tokenizedMessage[i] === 'string') {
                tokenizedMessage[i] = bttvMessageTokenize(sender, tokenizedMessage[i]);
            } else {
                tokenizedMessage[i] = tokenizedMessage[i][0];
            }
        }

        message = tokenizedMessage.join(' ');
    }

    return '<span class="message" '+(colored?'style="color: '+colored+'" ':'')+'data-raw="'+rawMessage+'" data-emotes="'+(emotes ? encodeURIComponent(JSON.stringify(emotes)) : 'false')+'">'+message+'</span>';
};
var privmsg = exports.privmsg = function(highlight, action, server, isMod, data) {
    return '<div class="chat-line'+(highlight?' highlight':'')+(action?' action':'')+(server?' admin':'')+'" data-sender="'+data.sender+'">'+timestamp(data.time)+' '+(isMod?modicons():'')+' '+badges(data.badges)+from(data.nickname, data.color)+message(data.sender, data.message, data.emotes, (action && !highlight)?data.color:false)+'</div>';
}
var whisperName = exports.whisperName = function(sender, receiver, from, to, fromColor, toColor) {
    return '<span style="color: '+fromColor+';" class="from" data-sender="'+sender+'">'+escape(from)+'</span><svg class="svg-whisper-arrow" height="10px" version="1.1" width="16px"><polyline points="6 2, 10 6, 6 10, 6 2"></polyline></svg><span style="color: '+toColor+';" class="from" data-sender="'+receiver+'">'+escape(to)+'</span><span class="colon">:</span>&nbsp;<wbr></wbr>';
}
var whisper = exports.whisper = function(data) {
    return '<div class="chat-line whisper" data-sender="'+data.sender+'">'+timestamp(data.time)+' '+whisperName(data.sender, data.receiver, data.from, data.to, data.fromColor, data.toColor)+message(data.sender, data.message, data.emotes, false)+'</div>';
}
