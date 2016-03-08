var chatHelpers = require('../chat/helpers');
var chatStore = require('../chat/store');
var chatTemplates = require('../chat/templates');
var overrideEmotes = require('./override-emotes');


function ChatReplay() {
    if (!(this instanceof ChatReplay)) return new ChatReplay();

    var _self = this;
    var switched = false;
    var watcher = new MutationObserver(function(mutations) {
        _self.loadEmotes();
        if (!switched && $('.chatReplay').length) {
            _self.cleaUpUI();
            switched = true;
            watcher.disconnect();
            watcher.observe($('.chat-lines')[0], { childList: true});
        }

        mutations.forEach(function(mutation) {
            var el, len = mutation.addedNodes.length;

            for (var i = 0; i < len; i++) {
                el = mutation.addedNodes[i];

                if ($(el).hasClass('chat-line')) {
                    if ($(el).find('.horizontal-line').length) return;
                    if ($('.chatReplay')) _self.messageParser(el);
                }
            }
        });
    });

    watcher.observe($('.app-main')[0], { childList: true, subtree: true});
}

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

ChatReplay.prototype.loadEmotes = function() {
    if (Object.keys(chatStore.bttvEmotes).length !== 0) return;

    if (window.Ember && window.App && App.__container__.lookup('controller:application').get('currentRouteName') === 'vod') {
        overrideEmotes();
        var channel = App.__container__.lookup('controller:user').get('id');
        $.getJSON('https://api.betterttv.net/2/channels/' + channel).done(function(data) {
            data.emotes.forEach(function(bttvEmote) {
                bttvEmote.channelEmote = true;
                bttvEmote.urlTemplate = data.urlTemplate.replace('{{id}}', bttvEmote.id);
                bttvEmote.url = bttvEmote.urlTemplate.replace('{{image}}', '1x');
                chatStore.bttvEmotes[bttvEmote.code] = bttvEmote;
            });
        });
    }
};

ChatReplay.prototype.cleaUpUI = function() {
    if ($('.chat-room').length) {
        $('.chat-interface').remove();
        $('.chat-room').css('top', 5);
        $('.chat-messages').css('bottom', 5);
    }
};

module.exports = ChatReplay;
