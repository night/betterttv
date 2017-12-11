const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const settings = require('../../settings');

const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_LINK_SELECTOR = 'a.chat-line__message--link';
const CHAT_LINE_CLIP_CARD_SELECTOR = '.chat-card__link';
const CHAT_LINE_DELETED_CLASS = 'bttv-chat-line-deleted';

function findAllUserMessages(name) {
    return Array.from(document.querySelectorAll(CHAT_LINE_SELECTOR)).filter(node => {
        const message = twitch.getChatMessageObject(node);
        if (!message) {
            return false;
        }
        if (!$(node).is(':visible')) {
            return false;
        }
        if (node.classList.contains(CHAT_LINE_DELETED_CLASS)) {
            return false;
        }
        return message.user.userLogin === name;
    });
}

class ChatDeletedMessagesModule {
    constructor() {
        settings.add({
            id: 'showDeletedMessages',
            name: 'Show Deleted Messages',
            defaultValue: false,
            description: 'Turn this on to change <message deleted> back to users\' messages.'
        });
        settings.add({
            id: 'hideDeletedMessages',
            name: 'Remove Deleted Messages',
            defaultValue: false,
            description: 'Completely removes timed out messages from view'
        });

        watcher.on('chat.buffer.event', event => {
            this.handleBufferEvent(event);
        });
    }

    handleBufferEvent({event, preventDefault}) {
        if (event.type === twitch.TMIActionTypes.CLEAR_CHAT) {
            twitch.sendChatAdminMessage('Chat was cleared by a moderator (Prevented by BetterTTV)');
            preventDefault();
        }
        if (event.type === twitch.TMIActionTypes.BAN || event.type === twitch.TMIActionTypes.TIMEOUT) {
            if (this.handleDelete(event.userLogin)) {
                preventDefault();
                // we still want to render moderation messages
                const chatController = twitch.getChatController();
                if (chatController) {
                    chatController.chatBuffer.delayedMessageBuffer.push({
                        event,
                        time: Date.now(),
                        shouldDelay: false
                    });
                }
                // TODO: we need to handle delayed messages.. not sure of an elegant way yet
            }
        }
    }

    handleDelete(name) {
        const showDeletedMessages = settings.get('showDeletedMessages');
        const hideDeletedMessages = settings.get('hideDeletedMessages');
        if (!hideDeletedMessages && !showDeletedMessages) {
            return false;
        }
        const messages = findAllUserMessages(name);
        messages.forEach(message => {
            const $message = $(message);
            if (hideDeletedMessages) {
                $message.hide();
            } else if (showDeletedMessages) {
                $message.toggleClass(CHAT_LINE_DELETED_CLASS, true);
                $message.find(CHAT_LINE_LINK_SELECTOR).each(function() {
                    const $link = $(this);
                    const $unlinked = $('<span />');
                    $unlinked.text($link.attr('href'));
                    $link.replaceWith($unlinked);
                });
                $message.find(CHAT_LINE_CLIP_CARD_SELECTOR).remove();
            }
        });
        return true;
    }
}

module.exports = new ChatDeletedMessagesModule();
