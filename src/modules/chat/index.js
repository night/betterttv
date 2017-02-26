const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const colors = require('../../utils/colors');
const settings = require('../../settings');

class ChatModule {
    constructor() {
        watcher.on('chat.message', ($element, message) => this.messageParser($element, message));
    }

    calculateColor(color) {
        return colors.calculateColor(color, settings.get('darkenedMode'));
    }

    emoticonize() {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].nodeType === window.Node.TEXT_NODE) {
                newTokens.push(bttvMessageTokenize(sender, tokens[i].data));
            } else if (tokens[i].nodeType === window.Node.ELEMENT_NODE && $(tokens[i]).children('.emoticon').length) {
                // this remakes Twitch's emoticon because they steal on-hover in ember-bound elements
                const $emote = $(tokens[i]).children('.emoticon');
                newTokens.push(emoticon(getEmoteId($emote), $emote.attr('alt')));
            } else {
                newTokens.push(tokens[i].outerHTML);
            }
        }
    }

    messageParser($element, message) {
        $element.find('.from').css('color', this.calculateColor(message.color));
        // const $message = $element.find('.message');
        debug.log($element, message);
    }
}

module.exports = new ChatModule();
