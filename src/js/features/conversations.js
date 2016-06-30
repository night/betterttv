var audibleFeedback = require('../features/audible-feedback');
var chatTemplates = require('../chat/templates');
var chatHelpers = require('../chat/helpers');
var colors = require('../helpers/colors');
var keyCodes = require('../keycodes');
var store = require('../chat/store');
var vars = require('../vars');

var conversationsClass = '.conversations-content';

function Conversations(timeout) {
    timeout = timeout || 0;

    if (bttv.settings.get('disableWhispers')) {
        $('.conversations-content').hide();
        return;
    }

    if (!(this instanceof Conversations)) return new Conversations(0);

    var $conversations = $(conversationsClass);
    var _self = this;

    this.toggleAutoHide();

    if (!$conversations.length) {
        setTimeout(function() {
            return new Conversations(2 * timeout);
        }, 2 * timeout);
        return;
    }

    if (window.App && App.__container__.lookup('service:whispers-shim')) {
        var whisperShim = App.__container__.lookup('service:whispers-shim');
        whisperShim.on('whisper', _self.onWhisper);

        // Called every time new messages are marked as read
        whisperShim.on('thread', function(data) {
            bttv.ws.joinConversation(data.id);
        });
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

Conversations.prototype.onWhisper = function(data) {
    if (bttv.settings.get('highlightFeedback') === true && bttv.chat.store.activeView === false) {
        var from = data & data.tags && data.tags.login;
        if (vars.userData.isLoggedIn && vars.userData.name !== from) {
            audibleFeedback.play();
        }
    }
};


Conversations.prototype.messageParser = function(element) {
    var from = element.querySelector('.from');
    var message = element.querySelector('.message');

    if (!from || !message) return;

    var $element = $(element);

    if ($element.hasClass('bttv-parsed-message')) return;
    $element.addClass('bttv-parsed-message');

    from.style.color = this.usernameRecolor(from.style.color);

    if ($element.hasClass('conversation-chat-line') && !$element.hasClass('conversation-preview-line')) {
        $element.append(chatTemplates.bttvElementTokenize(from, message));
        message.style.display = 'none';
    }

    this.scrollDownParent(element);
};

Conversations.prototype.scrollDownParent = function(element) {
    var container = $(element).parents('.conversation-content')[0];

    setTimeout(function() {
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    }, 500);
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

    if (bttv.settings.get('hideConversations')) this.slideUp();
    $(element).find('.header-button-container').children().last().on('click', function() {
        setTimeout(function() {
            if (bttv.settings.get('hideConversations')) _self.slideDown();
        }, 100);
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
    if (name in store.__bttvBadges) {
        var type = store.__bttvBadges[name];
        var badgeTemplate = chatTemplates.badge('bttv-' + type, '', store.__bttvBadgeTypes[type].description);
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

Conversations.prototype.toggleAutoHide = function() {
    var $conversations = $(conversationsClass);

    if (bttv.settings.get('hideConversations')) {
        this.slideDown();

        $conversations.hover(this.slideUp.bind(this), this.slideDown.bind(this));
    } else {
        this.slideUp();

        $conversations.off('mouseenter', this.slideUp.bind(this)).off('mouseleave', this.slideDown.bind(this));
    }
};

Conversations.prototype.slideDown = function() {
    var $conversations = $(conversationsClass);

    if ($conversations.find('.list-displayed').length || $conversations.find('.conversation-window').length) return;

    $conversations.animate({'bottom': '-26px'}, 100);
};

Conversations.prototype.slideUp = function() {
    var $conversations = $(conversationsClass);

    $conversations.animate({'bottom': '0px'}, 100);
};

module.exports = Conversations;
