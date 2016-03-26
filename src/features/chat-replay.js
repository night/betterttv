var chatHelpers = require('../chat/helpers');
var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');

function ChatReplay() {
    this._waitForLoad = setInterval(function() {
        if (!window.Ember || !window.App) return;

        var route = App.__container__.lookup('controller:application').get('currentRouteName');

        if (route === 'loading' || route !== 'vod') return;

        clearTimeout(this._waitForLoad);
        this._waitForLoad = null;

        chatHelpers.loadBTTVChannelData();

        this.connect();
    }.bind(this), 1000);
}

ChatReplay.prototype.connect = function() {
    this.watcher = new MutationObserver(function(mutations) {
        if ($('.chatReplay').length && $('.chat-lines').length) {
            this.watcher.disconnect();
            this.watcher.observe($('.chat-lines')[0], { childList: true, subtree: true });
        }

        mutations.forEach(function(mutation) {
            var el;
            for (var i = 0; i < mutation.addedNodes.length; i++) {
                el = mutation.addedNodes[i];

                if ($(el).hasClass('chat-line')) {
                    if ($(el).find('.horizontal-line').length) continue;
                    this.messageParser(el);
                }
            }
        }.bind(this));
    }.bind(this));

    this.watcher.observe($('body')[0], { childList: true, subtree: true });
};

ChatReplay.prototype.disconnect = function() {
    if (this._waitForLoad) clearTimeout(this._waitForLoad);
    this.watcher.disconnect();
};

ChatReplay.prototype.messageParser = function(element) {
    var $element = $(element);

    if ($element.find('.deleted').length) {
        $element.remove();
        return;
    }

    var $name = $element.find('.from');
    var color = $name.attr('style').replace('color:', '');
    $name.css('color', chatHelpers.calculateColor(color));

    var message = element.querySelector('.message');

    if (!message) return;
    message.innerHTML = this.emoticonize(message.innerHTML);
};

ChatReplay.prototype.emoticonize = function(message) {
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
            changed = true;
        }
    }
    return parts.join(' ');
};

module.exports = ChatReplay;
