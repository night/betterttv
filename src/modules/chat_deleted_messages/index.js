const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const settings = require('../../settings');
const Raven = require('raven-js');

let twitchClearChat;
function onClearChat(name, tags) {
    if (!name) {
        twitch.sendChatAdminMessage('Chat was cleared by a moderator (Prevented by BetterTTV)');
        return;
    }

    try {
        $('.chat-line')
            .each(function() {
                const $el = $(this);
                const view = twitch.getEmberView($el.attr('id'));
                if (!view || !view.msgObject || !view.msgObject.tags) return;
                if (view.msgObject.tags['user-id'] && view.msgObject.tags['user-id'] !== tags['target-user-id']) {
                    return;
                } else if (view.msgObject.from !== name) {
                    return;
                }

                if (settings.get('hideDeletedMessages') === true) {
                    $el.hide();
                    return;
                }

                const $message = $el.find('.message');
                if ($message.hasClass('bttv-deleted')) return;
                $message.addClass('bttv-deleted');
                $message.find('a').each(function() {
                    const $link = $(this);
                    const $unlinked = $('<span />');
                    $unlinked.text($link.attr('href'));
                    $link.replaceWith($unlinked);
                });

                if (!settings.get('showDeletedMessages')) {
                    const $messageClone = $message.clone();
                    $message.click(() => $message.replaceWith($messageClone));
                    $message.text('<message deleted>');
                }
            });
    } catch (e) {
        Raven.captureException(e);
        twitchClearChat.call(twitchClearChat, ...arguments);
    }
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
        watcher.on('load.chat', () => this.patch());
        watcher.on('load.chat_settings', () => this.patch());
        watcher.on('chat.message', ($el, msgObj) => this.checkDeleted($el, msgObj));
    }

    patch() {
        const currentChat = twitch.getCurrentChat();
        if (!currentChat || !currentChat.tmiRoom) return;
        const tmiRoom = currentChat.tmiRoom;
        const clearChatCallbacks = tmiRoom._events.clearchat;
        if (!clearChatCallbacks || !clearChatCallbacks[0]) return;
        if (clearChatCallbacks[0] !== onClearChat && !tmiRoom._bttvClearChatMonkeyPatched) {
            twitchClearChat = clearChatCallbacks[0];
        }
        delete tmiRoom._events.clearchat;
        tmiRoom.on('clearchat', onClearChat);
        tmiRoom._bttvClearChatMonkeyPatched = true;
    }

    checkDeleted($el, msgObj) {
        const $message = $el.find('.message');
        const text = $message.text().trim();
        if (text.includes('<deleted link>') && text !== msgObj.message) {
            $message.click(() => $message.text(msgObj.message));
            $message.addClass('bttv-deleted');
        }
    }
}

module.exports = new ChatDeletedMessagesModule();
