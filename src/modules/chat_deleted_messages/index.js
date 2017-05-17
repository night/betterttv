const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const settings = require('../../settings');
const Raven = require('raven-js');

const CHAT_EMBER = '.chat-room > div';

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

                // remove the clips cards
                $el.find('.chat-chip').remove();

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
                    $message.addClass('bttv-click');
                    $message.click(() => {
                        $message.replaceWith($messageClone);
                    });
                    $message.text('<message deleted>');
                }
            });

        // Remove messages in the delayed message queue
        const chatComponent = twitch.getEmberView($(CHAT_EMBER).attr('id'));
        if (chatComponent && chatComponent.room) {
            const filtered = chatComponent.room.delayedMessages.filter(msg => msg.from !== name);
            chatComponent.room.set('delayedMessages', filtered);
        }

        // this is a gross hack to show timeout messages without us having to implement them
        const currentChat = twitch.getCurrentChat();
        if (!currentChat) return;
        const tmiSession = currentChat.tmiSession;
        const sessionNick = tmiSession.nickname;
        tmiSession.nickname = ` ${sessionNick}`;
        twitchClearChat.call(twitchClearChat, ` ${name}`, tags);
        tmiSession.nickname = sessionNick;
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
    }

    patch() {
        const currentChat = twitch.getCurrentChat();
        if (!currentChat || !currentChat.tmiRoom) return;
        const tmiRoom = currentChat.tmiRoom;
        const clearChatCallbacks = tmiRoom._events.clearchat;
        if (!clearChatCallbacks || !clearChatCallbacks.length) return;
        const defaultClearChatCallback = clearChatCallbacks.find(c => c && c !== onClearChat);
        if (defaultClearChatCallback && !tmiRoom._bttvClearChatMonkeyPatched) {
            twitchClearChat = defaultClearChatCallback;
        }
        delete tmiRoom._events.clearchat;
        tmiRoom.on('clearchat', onClearChat);
        tmiRoom._bttvClearChatMonkeyPatched = true;

        if (!currentChat.roomProperties) return;
        currentChat.set('roomProperties.hide_chat_links', false);
    }
}

module.exports = new ChatDeletedMessagesModule();
