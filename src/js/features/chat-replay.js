var chatHelpers = require('../chat/helpers');
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

    if (Twitch.storage.getObject('chatSettings').showTimestamps === true) {
        $element.addClass('show-timestamp');
        var modIcons = $element.find('.mod-icons');
        $(element).find('.timestamp').insertAfter(modIcons);
    }

    if ($element.find('.deleted').length) {
        $element.remove();
        return;
    }

    var $name = $element.find('.from');
    var color = $name.attr('style').replace('color:', '');
    var newColor = chatHelpers.calculateColor(color);
    $name.css('color', newColor);

    var message = element.querySelector('.message');
    var $message = $(element).find('.message');

    if (!message) return;

    if ($message.attr('style')) $message.css('color', newColor);

    message.innerHTML = chatTemplates.bttvElementTokenize($name[0], message);
};

module.exports = ChatReplay;
