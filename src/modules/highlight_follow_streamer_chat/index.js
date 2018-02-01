const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const twitchAPI = require('../../utils/twitch-api');

const STYLE_HIGHLIGHT_FOLLOW = 'bttv-highlight-follow-nick';
const STYLE_HIGHLIGHT_STREAMER = 'bttv-highlight-streamer-nick';

const followsArray = [];
let currentChannelName;
let secondRequestAllowed = true;

function putFollowsInArray(direction, limit) {
    const currentUser = twitch.getCurrentUser();
    twitchAPI.get(`users/${currentUser.id}/follows/channels/?direction=${direction}&limit=${limit}`)
        .then(({_total: total, follows}) => {
            for (let i = 0; i < follows.length; i++) {
                followsArray.push(follows[i].channel.name);
            }
            if (total > 100 && secondRequestAllowed) {
                secondRequestAllowed = false;
                return putFollowsInArray('asc', total - 100);
            }
        });
}

class HighlightFollowAndStreamerChatModule {
    constructor() {
        settings.add({
            id: 'highlightFollowAndStreamerChat',
            name: 'Highlight favorite users in the chat',
            defaultValue: false,
            description: 'Highlight users you follow and streamer in the chat'
        });
        settings.on('changed.highlightFollowAndStreamerChat', () => this.load());
        watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));
        watcher.on('vod.message', $message => this.onVodMessage($message));
        watcher.on('load.chat', () => this.load());
        watcher.on('load.vod', () => this.load());
    }

    load() {
        if (settings.get('highlightFollowAndStreamerChat') === false) return;
        currentChannelName = twitch.getCurrentChannel().name;
        putFollowsInArray('desc', 100);
    }

    onMessage($message, {user}) {
        if (settings.get('highlightFollowAndStreamerChat') === false) return;
        // const mess = $message.find('.chat-author__display-name');
        if (currentChannelName === user.userLogin) {
            this.highlightNick($message, STYLE_HIGHLIGHT_STREAMER);
        } else if (followsArray.includes(user.userLogin)) {
            this.highlightNick($message, STYLE_HIGHLIGHT_FOLLOW);
        }
    }

    onVodMessage($message) {
        if (settings.get('highlightFollowAndStreamerChat') === false) return;
        const $from = $message.find('.video-chat__message-author');
        const username = $from.attr('href').split('?')[0].split('/').pop().toString();
        if (currentChannelName === username) {
            this.highlightNick($message, STYLE_HIGHLIGHT_STREAMER);
        } else if (followsArray.includes(username)) {
            this.highlightNick($message, STYLE_HIGHLIGHT_FOLLOW);
        }
    }

    highlightNick($message, style) {
        $message.find('.chat-author__display-name').addClass(style);
    }
}

module.exports = new HighlightFollowAndStreamerChatModule();
