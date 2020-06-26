const $ = require('jquery');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const settings = require('../../settings');

const CHAT_MESSAGE_LINE_SELECTOR = 'div.chat-line__message';
const VOD_MESSAGE_LINE_SELECTOR = 'div.vod-message';
const VOD_CHAT_FROM_SELECTOR = '.video-chat__message-author';
const MENTION_SELECTOR = '.mention-fragment';
const MESSAGE_AUTHORNAME_SELECTOR = '.chat-author__display-name';

const MODULE_MENTION_CSS_CLASS = 'bttv-follow-mention-fragment';
const MODULE_MENTION_SELECTOR = `.${MODULE_MENTION_CSS_CLASS}`;

const LOG_PREFIX = 'ChatFollowConversationsModule';

let currentMentioned = null;
let currentSender = null;
let currentMentionedColor;
let currentSenderColor;
let messageLineSelector = document.URL.match(/twitch\.tv\/videos/)
    ? VOD_MESSAGE_LINE_SELECTOR
    : CHAT_MESSAGE_LINE_SELECTOR;

let currentFocusTargets = {};

let lastMessageClickSelectionType;

function clearMarks() {
    $(`${messageLineSelector}`).css('background-color', '');
}

function markMentioned(mentioned) {
    $(`${messageLineSelector}[data-bttv-sender="${mentioned.toLowerCase()}"]`).css('background-color', currentMentionedColor);
}

function markSender(sender) {
    $(`${messageLineSelector}[data-bttv-sender="${sender.toLowerCase()}"]`).css('background-color', currentSenderColor);
}

function markFocus() {
    Object.keys(currentFocusTargets).forEach(user => {
        const color = currentFocusTargets[user];
        $(`${messageLineSelector}[data-bttv-sender="${user.toLowerCase()}"]`).css('background-color', color);
    });
}

function markMentioning() {
    $(`${messageLineSelector}`).each((i, element) => {
        const sender = $(element).data('bttv-sender');
        const $mentions = $(element).find(MENTION_SELECTOR);
        if ($mentions.length === 0) return;
        const highlightColor = $(element)
            .find(MESSAGE_AUTHORNAME_SELECTOR)
            .css('color')
            .replace(/^rgb\(/, 'rgba(')
            .replace(/\)$/, ', 0.15)');
        $mentions.each((j, mention) => {
            const mentionedUser = $(mention).text().toLowerCase().replace('@', '');
            if (currentFocusTargets[mentionedUser] && !currentFocusTargets[sender]) {
                $(element).css('background-color', highlightColor);
            }
        });
    });
}

function getUserColors(mentioned, sender) {
    const messagesFromSender = $(`${messageLineSelector}[data-bttv-sender=${sender}]`);
    const messagesFromMentioned = $(`${messageLineSelector}[data-bttv-sender=${mentioned}]`);

    let senderColor = messagesFromSender.length
        ? messagesFromSender
            .find(MESSAGE_AUTHORNAME_SELECTOR)
            .css('color')
        : null;
    let mentionedColor = messagesFromMentioned.length
        ? messagesFromMentioned
            .find(MESSAGE_AUTHORNAME_SELECTOR)
            .css('color')
        : null;

    const senderAlpha = (senderColor === mentionedColor)
        ? '0.15'
        : '0.3';

    senderColor = senderColor
        ? senderColor
            .replace(')', `, ${senderAlpha})`)
            .replace('rgb(', 'rgba(')
        : null;
    mentionedColor = mentionedColor
        ? mentionedColor
            .replace(')', ', 0.3)')
            .replace('rgb(', 'rgba(')
        : null;

    return [mentionedColor, senderColor];
}

class ChatFollowConversationsModule {
    constructor() {
        watcher.on('load.chat', () => this.onChatLoad());
        watcher.on('load.vod', () => this.onChatLoad());
        watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));
        watcher.on('vod.message', $message => this.onVODMessage($message));

        settings.add({
            id: 'followConversations',
            name: 'Follow Conversations',
            defaultValue: false,
            description: 'Click on a @mention in chat to follow a conversation, ctrl+click messages to follow the senders',
        });
        settings.on('changed.followConversations', () => {
            debug.log(`${LOG_PREFIX}: Setting followConversations changed and is now ${settings.get('followConversations') ? 'ON' : 'OFF'}`);
            currentMentioned = null;
            currentSender = null;
            clearMarks();
            this.styleMentions();
        });

        debug.log(`${LOG_PREFIX}: module loaded`);
    }

    onChatLoad() {
        messageLineSelector = document.URL.match(/twitch\.tv\/videos/)
            ? VOD_MESSAGE_LINE_SELECTOR
            : CHAT_MESSAGE_LINE_SELECTOR;
        clearMarks();
        this.listenForMentionClicks();
        this.listenForTextClicks();
    }

    onMessage($message, {user}) {
        const sender = user.userLogin.toLowerCase();
        this.dataTagSender($message, sender);

        if (settings.get('traceMentions')) {
            if (currentMentioned === sender) {
                if (!currentMentionedColor) [currentMentionedColor, currentSenderColor] = getUserColors(currentMentioned, currentSender);
                $message.css('background-color', currentMentionedColor);
            }
            if (currentSender === sender) {
                if (!currentSenderColor) [currentMentionedColor, currentSenderColor] = getUserColors(currentMentioned, currentSender);
                $message.css('background-color', currentSenderColor);
            }
            if (currentFocusTargets[sender]) {
                $message.css('background-color', currentFocusTargets[sender]);
            } else if (this.messageMentionsUser($message, Object.keys(currentFocusTargets))) {
                const highlightColor = $message
                    .find(MESSAGE_AUTHORNAME_SELECTOR)
                    .css('color')
                    .replace(/^rgb\(/, 'rgba(')
                    .replace(/\)$/, ', 0.15)');
                $message.css('background-color', highlightColor);
            }
            $message.find(MENTION_SELECTOR).addClass(MODULE_MENTION_CSS_CLASS);
        }
    }

    onVODMessage($message) {
        const $from = $message.find(VOD_CHAT_FROM_SELECTOR);
        const sender = $from.attr('href').split('?')[0].split('/').pop();
        this.dataTagSender($message, sender);

        if (settings.get('followConversations')) {
            if (currentMentioned === sender) {
                if (!currentMentionedColor) currentMentionedColor = getUserColors()[0];
                $message.css('background-color', currentMentionedColor);
            }
            if (currentSender === sender) {
                if (!currentSenderColor) currentSenderColor = getUserColors()[1];
                $message.css('background-color', currentSenderColor);
            }
            if (currentFocusTargets[sender]) {
                $message.css('background-color', currentFocusTargets[sender]);
            } else if (this.messageMentionsUser($message, Object.keys(currentFocusTargets))) {
                const highlightColor = $message
                    .find(MESSAGE_AUTHORNAME_SELECTOR)
                    .css('color')
                    .replace(/^rgb\(/, 'rgba(')
                    .replace(/\)$/, ', 0.15)');
                $message.css('background-color', highlightColor);
            }
            $message.find(MENTION_SELECTOR).addClass(MODULE_MENTION_CSS_CLASS);
        }
    }

    listenForMentionClicks() {
        $(document).on('click', MENTION_SELECTOR, function(event) {
            if (settings.get('followConversations')) {
                const mention = $(this).text().toLowerCase();
                const sender = $(this).parents(`${messageLineSelector}`).data('bttv-sender');
                debug.log(`${LOG_PREFIX}: Clicked on a mention span for ${mention} sent by ${sender}.`);
                const mentioned = mention.replace('@', '');
                [currentMentionedColor, currentSenderColor] = getUserColors(mentioned, sender);
                clearMarks();
                markMentioned(mentioned);
                markSender(sender);
                currentMentioned = mentioned;
                currentSender = sender;
                currentFocusTargets = {};
                event.stopPropagation();
            }
        });
        debug.log(`${LOG_PREFIX}: Listener attached to clicks on mention fragments`);
    }

    listenForTextClicks() {
        $(document).on('click', `${messageLineSelector}`, function(event) {
            if (settings.get('followConversations')) {
                if (event.ctrlKey) {
                    const username = $(this).data('bttv-sender');
                    debug.log(`${LOG_PREFIX}: Ctrl+clicked in a message from ${username}`);
                    const focus = username.toLowerCase();
                    const focusColor = $(this)
                        .find(MESSAGE_AUTHORNAME_SELECTOR)
                        .css('color')
                        .replace(/^rgb\(/, 'rgba(')
                        .replace(/\)$/, ', 0.3)');
                    if (currentFocusTargets[focus]) {
                        delete currentFocusTargets[focus];
                    } else {
                        currentFocusTargets[focus] = focusColor;
                    }
                    clearMarks();
                    markFocus();
                    markMentioning(username);
                    currentMentioned = null;
                    currentSender = null;
                    event.stopPropagation();
                } else if (window.getSelection().type === 'Caret' && lastMessageClickSelectionType === 'Caret') {
                    debug.log(`${LOG_PREFIX}: Clicked elsewhere in a message.`);
                    clearMarks();
                    currentMentioned = null;
                    currentSender = null;
                    currentFocusTargets = {};
                }
            }
            lastMessageClickSelectionType = window.getSelection().type;
        });
        debug.log(`${LOG_PREFIX}: Listener attached to clicks on message lines.`);
    }

    messageMentionsUser($message, usernames) {
        if (usernames.length === 0) return false;
        const $mentions = $message.find(MENTION_SELECTOR);
        if ($mentions.length === 0) return false;
        let mentionsUsername = false;
        $mentions.each((i, mention) => {
            const mentionedUser = $(mention).text().toLowerCase().replace('@', '');
            if (usernames.includes(mentionedUser)) {
                mentionsUsername = true;
                return;
            }
        });
        return mentionsUsername;
    }

    dataTagSender($message, sender) {
        $message.attr('data-bttv-sender', sender);
    }

    styleMentions() {
        if (settings.get('followConversations')) {
            $(MENTION_SELECTOR).addClass(MODULE_MENTION_CSS_CLASS);
        } else {
            $(`${MENTION_SELECTOR}${MODULE_MENTION_SELECTOR}`).removeClass(MODULE_MENTION_CSS_CLASS);
        }
    }
}

module.exports = new ChatFollowConversationsModule();
