const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const settings = require('../../settings');
const emotes = require('../emotes');
const nicknames = require('../chat_nicknames');

const EMOTE_STRIP_SYMBOLS_REGEX = /(^[~!@#$%\^&\*\(\)]+|[~!@#$%\^&\*\(\)]+$)/g;

function formatChatUser({from, color, tags}) {
    if (!tags || from === 'jtv') return null;

    return {
        id: tags['user-id'],
        name: tags.login || from,
        displayName: tags['display-name'],
        color: tags.color || color,
        mod: tags.mod,
        subscriber: tags.subscriber,
        badges: tags.badges
    };
}

let asciiOnly = false;
let subsOnly = false;
let modsOnly = false;

function hasNonASCII(message) {
    for (let i = 0; i < message.length; i++) {
        if (message.charCodeAt(i) > 128) return true;
    }
    return false;
}

class ChatModule {
    constructor() {
        watcher.on('chat.message', ($element, message) => this.messageParser($element, message));
        watcher.on('conversation.message', ($element, message) => this.messageParser($element, message));
    }

    calculateColor(color) {
        return colors.calculateColor(color, settings.get('darkenedMode'));
    }

    customBadges() {

    }

    asciiOnly(enabled) {
        asciiOnly = enabled;
    }

    subsOnly(enabled) {
        subsOnly = enabled;
    }

    modsOnly(enabled) {
        modsOnly = enabled;
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

    messageParser($element, messageObj) {
        const user = formatChatUser(messageObj);
        if (!user) return;

        const color = this.calculateColor(user.color);
        const $from = $element.find('.from');
        $from.css('color', color);

        const nickname = nicknames.get(user.name);
        if (nickname) {
            $from.text(nickname);
        }

        const $message = $element.find('.message');
        const messageStyle = $message.attr('style');
        if (messageStyle && messageStyle.includes('color:')) {
            $message.css('color', color);
        }

        if (
            (modsOnly === true && !user.mod) ||
            (subsOnly === true && !user.subscriber) ||
            (asciiOnly === true && hasNonASCII(messageObj.message))
        ) {
            $element.hide();
        }

        this.emoticonize($message, user);
    }

    dismissPinnedCheer() {
        try {
            const service = window.App.__container__.lookup('service:bits-pinned-cheers');
            if (service.topPinnedCheer || service.recentPinnedCheer) service.dismissLocalMessage();
        } catch (dismissError) {
            debug.log('Failed to dismiss cheer:', dismissError);
        }
    }
}

module.exports = new ChatModule();
