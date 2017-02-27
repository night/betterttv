const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const settings = require('../../settings');
const emotes = require('../emotes');

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g;

function formatChatUser({from, color, tags}) {
    if (!tags || from === 'jtv') return null;

    return {
        id: tags['user-id'],
        name: from,
        displayName: tags['display-name'],
        color,
        mod: tags.mod,
        subscriber: tags.subscriber,
        badges: tags.badges
    };
}

class ChatModule {
    constructor() {
        watcher.on('chat.message', ($element, message) => this.messageParser($element, message));
    }

    calculateColor(color) {
        return colors.calculateColor(color, settings.get('darkenedMode'));
    }

    customBadges() {

    }

    emoticonize($message, user) {
        const tokens = $message.contents();
        for (let i = 0; i < tokens.length; i++) {
            const node = tokens[i];
            if (node.nodeType !== window.Node.TEXT_NODE) continue;

            const parts = node.data.split(' ');
            let modified = false;
            for (let j = 0; j < parts.length; j++) {
                const part = parts[j];
                let emote = emotes.getEligibleEmote(part, user);
                if (!emote) {
                    emote = emotes.getEligibleEmote(part.replace(EMOTE_STRIP_SYMBOLS_REGEX, ''), user);
                }
                if (!emote) continue;
                modified = true;
                parts[j] = emote.toHTML();
            }

            if (modified) {
                // TODO: find a better way to do this (this seems most performant tho, only a single mutation vs multiple)
                const span = document.createElement('span');
                span.innerHTML = parts.join(' ');
                node.parentNode.replaceChild(span, node);
            }
        }
    }

    messageParser($element, message) {
        $element.find('.from').css('color', this.calculateColor(message.color));
        const $message = $element.find('.message');
        this.emoticonize($message, formatChatUser(message));
    }
}

module.exports = new ChatModule();
