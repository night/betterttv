const $ = require('jquery');
const twitch = require('../../utils/twitch');
const keyCodes = require('../../utils/keycodes');
const chatModerationCards = require('../chat_moderator_cards');

const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';

class ModKeybindsModule {
    constructor() {
        this.load();
    }

    load() {
        $('body').on('keydown', e => this.onKeyDown(e));
    }

    onKeyDown(e) {
        if (e.shiftKey || e.ctrlKey) return;
        if (!chatModerationCards.isOpen()) return;

        const keyCode = e.keyCode || e.which;
        const isMod = twitch.getCurrentUserIsModerator();
        const user = chatModerationCards.getUser();

        if (keyCode === keyCodes.Esc) {
            chatModerationCards.close();
        } else if (keyCode === keyCodes.t && isMod) {
            twitch.sendChatMessage('/timeout ' + user.name);
            chatModerationCards.close();
        } else if (keyCode === keyCodes.p && isMod) {
            twitch.sendChatMessage('/timeout ' + user.name + ' 1');
            chatModerationCards.close();
        } else if (keyCode === keyCodes.a && isMod) {
            twitch.sendChatMessage('!permit ' + user.name);
            chatModerationCards.close();
        } else if (keyCode === keyCodes.u && isMod) {
            twitch.sendChatMessage('/unban ' + user.name);
            chatModerationCards.close();
        } else if (keyCode === keyCodes.b && isMod) {
            twitch.sendChatMessage('/ban ' + user.name);
            chatModerationCards.close();
        } else if (keyCode === keyCodes.i) {
            twitch.sendChatMessage('/ignore ' + user.name);
            chatModerationCards.close();
        } else if (keyCode === keyCodes.w) {
            e.preventDefault();
            const $chatInput = $(CHAT_TEXT_AREA);
            $chatInput.val('/w ' + user.name + ' ');
            $chatInput.focus();
            chatModerationCards.close();
        }
    }
}

module.exports = new ModKeybindsModule();
