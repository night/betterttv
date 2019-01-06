const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const cdn = require('../../utils/cdn');
const settings = require('../../settings');

const CHAT_MENTION_NOTIFICATION_ID = 'bttv_mention_notification';

class ChatMentionNotificationModule {
    constructor() {
        settings.add({
            id: 'chatMentionNotification',
            name: 'Play Mention Sound Notification',
            defaultValue: false,
            description: 'Plays a notification sound when you\'re mentioned in chat'
        });

        this.username = twitch.getChatServiceClient().configuration.username.toLowerCase();
        this.enabled = false;

        this.load = this.load.bind(this);
        this.handleMessage = this.handleMessage.bind(this);

        this.load(settings.get('chatMentionNotification'));
        settings.on('changed.chatMentionNotification', this.load);
        watcher.on('chat.message.handler', this.handleMessage);
    }

    load(value) {
        this.enabled = value;
    }

    handleMessage({message}) {
        if (!this.enabled) {
            return;
        }
        const {messageParts = []} = message;
        const isMentioned = messageParts.some(({content}) => {
            if (typeof content === 'object' && content !== null) {
                const {recipient = '', currentUserMentionRelation} = content;

                return recipient.toLowerCase() === this.username && typeof currentUserMentionRelation !== 'undefined';
            }

            return false;
        });

        if (isMentioned) {
            let node = $(`#${CHAT_MENTION_NOTIFICATION_ID}`);

            if (node.length) {
                node[0].play();
            } else {
                node = document.createElement('audio');
                node.hidden = 'hidden';
                node.id = CHAT_MENTION_NOTIFICATION_ID;
                node.autoplay = true;
                node.src = cdn.url('assets/notification.mp3');
                document.body.appendChild(node);
            }
        }
    }
}

module.exports = new ChatMentionNotificationModule();
