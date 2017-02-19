const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const colors = require('../../utils/colors');
const settings = require('../../settings');

/* TODO:
 - Chat image preview
 - Link unfurl
 - Emoji
 - Emotes
 - Mention mod cards
 - Highlights/Blacklist
 - Emote hover info
 - Commands
 - Custom mod cards
 - Alpha chat badges?
 - Tab completion?
 - Disable localized names
 - Disable name colors
*/

class ChatModule {
    constructor() {
        watcher.on('chat.message', this.messageParser);
    }

    calculateColor(color) {
        var colorRegex = /^#[0-9a-f]+$/i;
        if (colorRegex.test(color)) {
            while (
                (
                    colors.calculateColorBackground(color) === 'light' &&
                    settings.get('darkenedMode') === true
                ) ||
                (
                    colors.calculateColorBackground(color) === 'dark' &&
                    settings.get('darkenedMode') !== true
                )
            ) {
                color = colors.calculateColorReplacement(
                    color,
                    colors.calculateColorBackground(color)
                );
            }
        }

        return color;
    }

    emoticonize() {
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
    }

    messageParser($element, message) {
        debug.log($element, message);
    }
}

module.exports = new ChatModule();
