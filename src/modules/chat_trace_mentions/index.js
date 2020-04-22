const $ = require('jquery');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const settings = require('../../settings');

const CHAT_MESSAGE_LINE_SELECTOR = 'div.chat-line__message';

const DEFAULT_SENDER_TRACE_COLOUR = 'rgb(0, 255, 255)';
const DEFAULT_MENTIONED_TRACE_COLOUR = 'rgb(0, 255, 0) ';

let currentMentionedColor = DEFAULT_MENTIONED_TRACE_COLOUR;
let currentSenderColor = DEFAULT_SENDER_TRACE_COLOUR;

function clearMarks() {
    $(`${CHAT_MESSAGE_LINE_SELECTOR}`).css('background-color', '');
}

function markMentioned(mentioned) {
    $(`${CHAT_MESSAGE_LINE_SELECTOR}[data-bttv-sender="${mentioned}"]`).css('background-color', currentMentionedColor);
}

function markSender(sender) {
    $(`${CHAT_MESSAGE_LINE_SELECTOR}[data-bttv-sender="${sender}"]`).css('background-color', currentSenderColor);
}

function getUserColors(mentioned, sender) {
    const messagesFromSender = $(`${CHAT_MESSAGE_LINE_SELECTOR}[data-bttv-sender=${sender}]`);
    const messagesFromMentioned = $(`${CHAT_MESSAGE_LINE_SELECTOR}[data-bttv-sender=${mentioned}]`);

    let senderColor = messagesFromSender.length
        ? messagesFromSender
            .find('.chat-author__display-name')
            .css('color')
        : DEFAULT_SENDER_TRACE_COLOUR;
    let mentionedColor = messagesFromMentioned.length
        ? messagesFromMentioned
            .find('.chat-author__display-name')
            .css('color')
        : DEFAULT_MENTIONED_TRACE_COLOUR;

    const senderAlpha = (senderColor === mentionedColor)
        ? '0.15'
        : '0.3';

    senderColor = senderColor
        .replace(')', `, ${senderAlpha})`)
        .replace('rgb(', 'rgba(');
    mentionedColor = mentionedColor
        .replace(')', ', 0.3')
        .replace('rgb(', 'rgba(');

    return [mentionedColor, senderColor];
}

let currentMentioned = null;
let currentSender = null;
class ChatTraceMentionsModule {
    constructor() {
        watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));

        settings.add({
            id: 'traceMentions',
            name: 'Trace Mentions',
            defaultValue: false,
            description: 'Click on a @mention in chat to highlight messages from the mentioned and the mentioner',
        });
        settings.on('changed.traceMentions', () => {
            currentMentioned = null;
            currentSender = null;
            clearMarks();
            this.styleMentions();
        });

        settings.add({
            id: 'traceMentionsMoreVisible',
            name: 'Trace Mentions: More Visible Mentions',
            defaultValue: false,
            description: 'Make mentions stand out more and use the \'pointer\' cursor'
        });
        settings.on('changed.traceMentionsMoreVisible', () => this.styleMentions());

        this.listenForMentionClicks();
        this.listenForTextClicks();
    }

    onMessage($message, {user}) {
        // data tag it with its sender
        const sender = user.userLogin.toLowerCase();
        this.dataTagSender($message, sender);

        if (settings.get('traceMentions')) {
            // if the sender is the mentioned or mention-sender, mark it
            if (currentMentioned === sender) {
                $message.css('background-color', currentMentionedColor);
            }
            if (currentSender === sender) {
                $message.css('background-color', currentSenderColor);
            }
            if (settings.get('traceMentionsMoreVisible')) {
                $message.find('.mention-fragment').addClass('bttv-trace-mention-fragment');
            }
        }
    }

    dataTagSender($message, sender) {
        $message.attr('data-bttv-sender', sender);
    }

    listenForMentionClicks() {
        $(document).on('click', '.mention-fragment', function(event) {
            const mention = $(this).text().toLowerCase();
            const sender = $(this).parent(`${CHAT_MESSAGE_LINE_SELECTOR}`).data('bttv-sender');
            debug.log(`Clicked on a mention span for ${mention} sent by ${sender}.`);
            const mentioned = mention.replace('@', '');
            [currentMentionedColor, currentSenderColor] = getUserColors(mentioned, sender);
            clearMarks();
            if (settings.get('traceMentions')) {
                markMentioned(mentioned);
                markSender(sender);
            }
            currentMentioned = mentioned;
            currentSender = sender;
            event.stopPropagation();
        });
    }

    listenForTextClicks() {
        $(document).on('click', `${CHAT_MESSAGE_LINE_SELECTOR}`, () => {
            debug.log('Clicked elsewhere in a message.');
            clearMarks();
            currentMentioned = null;
            currentSender = null;
        });
    }

    styleMentions() {
        if (settings.get('traceMentions') && settings.get('traceMentionsMoreVisible')) {
            // apply .bttv-trace-mention-fragment to all .mention-fragment
            $('.mention-fragment').addClass('bttv-trace-mention-fragment');
        } else {
            // remove .bttv-trace-mention-fragment from all .bttv-trace-mention-fragment
            $('.mention-fragment.bttv-trace-mention-fragment').removeClass('bttv-trace-mention-fragment');
        }
    }
}

module.exports = new ChatTraceMentionsModule();
