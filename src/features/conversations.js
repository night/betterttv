var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');
var chatHelpers = require('../chat/helpers');
var colors = require('../helpers/colors');
var store = require('../chat/store');

var conversationsContainer = '.conversations-content';
var conversationContainer = '.conversation-content';
var conversationLine = '.conversation-chat-line';

function Conversations(timeout) {
    timeout = timeout || 0;

    if (!(this instanceof Conversations)) return new Conversations(0);

    var $conversations = $(conversationsContainer);

    if (!$conversations.length) {
        setTimeout(function() {
            return new Conversations(2 * timeout);
        }, 2 * timeout);
        return;
    }

    var _self = this;

    var watcher = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var el, subEls, len = mutation.addedNodes.length;

            for (var i = 0; i < len; i++) {
                el = mutation.addedNodes[i];
                if (!el.querySelector) return;

                if ($(el).hasClass('conversation-window')) _self.newConversation(el);

                _self.messageParser(el);

                subEls = el.querySelectorAll(conversationLine);
                for (var j = 0; j < subEls.length; j++) {
                    _self.messageParser(subEls[j]);
                }
            }
        });
    });

    watcher.observe($conversations[0], { childList: true, subtree: true });
}

Conversations.prototype.messageParser = function(element) {
    var from = element.querySelector('.from');
    var message = element.querySelector('.message');

    if (!from || !message) return;

    var $element = $(element);

    if ($element.hasClass('bttv-parsed-message')) return;
    $element.addClass('bttv-parsed-message');

    from.style.color = this.usernameRecolor(from.style.color);
    message.innerHTML = this.emoticonize(message.innerHTML);

    this.scrollDownParent(element);
};

Conversations.prototype.scrollDownParent = function(element) {
    var container = $(element).parents(conversationContainer)[0];

    setTimeout(function() {
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, 500);
};

Conversations.prototype.emoticonize = function(message) {
    if (bttv.settings.get('bttvEmotes') === false) return message;

    var parts = message.split(' ');
    var test;
    var emote;

    for (var i = 0; i < parts.length; i++) {
        test = parts[i].replace(/(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g, '');
        emote = null;

        if (chatStore.bttvEmotes.hasOwnProperty(parts[i])) {
            emote = chatStore.bttvEmotes[parts[i]];
        } else if (chatStore.bttvEmotes.hasOwnProperty(test)) {
            emote = chatStore.bttvEmotes[test];
        }

        if (
            emote &&
            emote.urlTemplate &&
            (emote.imageType === 'png' || (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') === true))
        ) {
            parts[i] = chatTemplates.bttvEmoticonize(parts[i], emote);
        }
    }

    return parts.join(' ');
};

Conversations.prototype.usernameRecolor = function(color) {
    var matcher = color.match(/rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/);

    if (!matcher) return color;

    return chatHelpers.calculateColor(colors.getHex({
        r: matcher[1],
        g: matcher[2],
        b: matcher[3]
    }));
};

Conversations.prototype.newConversation = function(element) {
    this.addBadges(element);
};

Conversations.prototype.addBadges = function(element) {
    var $element = $(element);
    var name = $element.find('.conversation-header-name').text().toLowerCase();
    if (name in store.__badges) {
        var type = store.__badges[name];
        var badgeTemplate = chatTemplates.badge('bttv-' + type, '', store.__badgeTypes[type].description);
        $element.find('.badges').prepend($.parseHTML(badgeTemplate));
    }
};

module.exports = Conversations;
