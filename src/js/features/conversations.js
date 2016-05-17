var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');
var chatHelpers = require('../chat/helpers');
var colors = require('../helpers/colors');
var keyCodes = require('../keycodes');
var store = require('../chat/store');

function Conversations(timeout) {
    timeout = timeout || 0;

    if (bttv.settings.get('disableWhispers')) {
        $('.conversations-content').hide();
        return;
    }

    if (!(this instanceof Conversations)) return new Conversations(0);

    var $conversations = $('.conversations-content');

    if (bttv.settings.get('hideConversations')) {

        $conversations.hover(function() {
        }, function() {
            if ($(this).find('.list-displayed').length || $(this).find('.conversation-window').length) return;
        });
    }


    if (!$conversations.length) {
        setTimeout(function() {
            return new Conversations(2 * timeout);
        }, 2 * timeout);
        return;
    }

    var watcher = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName) _self.updateTitle(mutation);
            var el, subEls, len = mutation.addedNodes.length;

            for (var i = 0; i < len; i++) {
                el = mutation.addedNodes[i];
                if (!el.querySelector) return;

                if ($(el).hasClass('conversation-window')) _self.newConversation(el);

                _self.messageParser(el);

                subEls = el.querySelectorAll('.conversation-chat-line');
                for (var j = 0; j < subEls.length; j++) {
                    _self.messageParser(subEls[j]);
                }
            }
        });
    });

    watcher.observe($conversations[0], { childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
}

Conversations.prototype.messageParser = function(element) {
    var from = element.querySelector('.from');
    var message = element.querySelector('.message');

    if (!from || !message) return;

    var $element = $(element);

    if ($element.hasClass('bttv-parsed-message')) return;
    $element.addClass('bttv-parsed-message');

    from.style.color = this.usernameRecolor(from.style.color);
    // message.innerHTML = this.emoticonize(message.innerHTML);

    this.scrollDownParent(element);
};

Conversations.prototype.scrollDownParent = function(element) {
    var container = $(element).parents('.conversation-content')[0];

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
    var _self = this;
    var $chatInput = $(element).find('.chat_text_input');
    var name = $(element).find('.conversation-header-name').text().toLowerCase();

    $(element).find('.header-button-container').children().last().on('click', function() {
    });


    function storeMessage(message) {
        if (!bttv.settings.get('chatLineHistory')) return;
        if (store.whisperHistory[name]) {
            if (store.whisperHistory[name].indexOf(message) !== -1) {
                store.whisperHistory[name].splice(store.whisperHistory[name].indexOf(message), 1);
            }
            store.whisperHistory[name].unshift(message);
        } else {
            store.whisperHistory[name] = [message];
        }
    }

    function loadHistory(e) {
        $chatInput = $(element).find('.chat_text_input');
        if (!bttv.settings.get('chatLineHistory')) return;
        if (!store.whisperHistory[name]) return;
        var historyIndex = store.whisperHistory[name].indexOf($chatInput.val().trim());
        if (e.keyCode === keyCodes.UpArrow) {
            if (historyIndex >= 0) {
                if (store.whisperHistory[name][historyIndex + 1]) {
                    $chatInput.val(store.whisperHistory[name][historyIndex + 1]);
                }
            } else {
                if ($chatInput.val().trim().length) {
                    store.whisperHistory[name].unshift($chatInput.val().trim());
                    $chatInput.val(store.whisperHistory[name][1]);
                } else {
                    $chatInput.val(store.whisperHistory[name][0]);
                }
            }
        } else if (e.keyCode === keyCodes.DownArrow) {
            if (historyIndex >= 0) {
                if (store.whisperHistory[name][historyIndex - 1]) {
                    $chatInput.val(store.whisperHistory[name][historyIndex - 1]);
                } else {
                    $chatInput.val('');
                }
            }
        }
    }

    $chatInput.on('keydown', function(e) {
        if (e.which === keyCodes.Enter) {
            var val = $chatInput.val().trim();
            if (bttv.settings.get('chatLineHistory') === true) {
                storeMessage(val);
            }
        }
        loadHistory(e);
    });

    $(element).find('.send-button').on('click', function() {
        var val = $chatInput.val().trim();
        if (bttv.settings.get('chatLineHistory') === true) {
            storeMessage(val);
        }
    });

    $(element).find('.svg-close').on('click', function() {
        setTimeout(function() {
            _self.updateTitle();
        }, 500);
    });

    this.addBadges(element);
};

Conversations.prototype.addBadges = function(element) {
    var $element = $(element);
    var name = $element.find('.conversation-header-name').text().toLowerCase();
    if (name in store.__badges) {
        var type = store.__badges[name];
        var badgeTemplate = chatTemplates.badge('bttv-' + type, '', store.__badgeTypes[type].description);
        $element.find('.badges').prepend(badgeTemplate);
    }
};

Conversations.prototype.updateTitle = function(m) {
    if (!bttv.settings.get('unreadInTitle')) return;

    if (!m || $(m.target).is('.conversation-window, .has-unread, .incoming')) {
        var title = document.title;
        var hasUnreads = $('.has-unread').length;
        if (hasUnreads) {
            var numOfUnreads = 0;
            var $headers = $('.conversation-unread-count');
            for (var i = 0; i < $headers.length; i++) {
                numOfUnreads += Number($($headers[i]).text());
            }
            if (!numOfUnreads) return;
            numOfUnreads = '(' + numOfUnreads + ') ';
            if (title.charAt(0) === '(') {
                document.title = document.title.replace(/\(\d+\)\s/, numOfUnreads);
            } else {
                document.title = numOfUnreads + title;
            }
        } else {
            if (title.charAt(0) === '(') {
                document.title = document.title.replace(/\(\d+\)\s/, '');
            }
        }
    }
};

module.exports = Conversations;
