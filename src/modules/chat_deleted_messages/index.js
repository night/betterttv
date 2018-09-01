const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const settings = require('../../settings');

const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_LINK_SELECTOR = 'a.link-fragment';
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

        watcher.on('chat.message.handler', message => {
            this.handleMessage(message);
        });
    }

    handleMessage({message, preventDefault}) {
        switch (message.type) {
            case twitch.TMIActionTypes.CLEAR_CHAT:
                twitch.sendChatAdminMessage('Chat was cleared by a moderator (Prevented by BetterTTV)');
                preventDefault();
                break;
            case twitch.TMIActionTypes.MODERATION:
                if (this.handleDelete(message.userLogin || message.user.userLogin)) {
                    preventDefault();
                    // we still want to render moderation messages
                    const chatBuffer = twitch.getChatBuffer();
                    if (chatBuffer) {
                        chatBuffer.state.messages.push(message);
                        chatBuffer.onBufferUpdate();
                    }
                }
                break;
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
