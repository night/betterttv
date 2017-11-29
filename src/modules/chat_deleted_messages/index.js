const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const settings = require('../../settings');

const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_DELETED_CLASS = 'bttv-chat-line-deleted';

function findAllUserMessages(userlogin) {
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
        return message.user.userLogin === userlogin;
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

    handleBufferEvent({ event, preventDefault }) {
        if (event.type === twitch.TMIActionTypes.CLEAR_CHAT) {
            twitch.sendChatAdminMessage('Chat was cleared by a moderator (Prevented by BetterTTV)');
            preventDefault();
        }
        if (event.type === twitch.TMIActionTypes.BAN || event.type === twitch.TMIActionTypes.TIMEOUT) {
            if (this.handleDelete(event.userLogin)) {
                preventDefault();
            }
        }
    }

    handleDelete(userlogin) {
        const showDeletedMessages = settings.get('showDeletedMessages');
        const hideDeletedMessages = settings.get('hideDeletedMessages');
        if (!hideDeletedMessages && !showDeletedMessages) {
            return false;
        }
        const messages = findAllUserMessages(userlogin);
        messages.forEach(node => {
            if (hideDeletedMessages) {
                $(node).hide();
            } else if (showDeletedMessages) {
                node.classList.add(CHAT_LINE_DELETED_CLASS);
            }
        });
        return true;
    }
}

module.exports = new ChatDeletedMessagesModule();
