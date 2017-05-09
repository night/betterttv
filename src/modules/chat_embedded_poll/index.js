const $ = require('jquery');
const watcher = require('../../watcher');

const STRAWPOLL_REGEX = /strawpoll\.me\/([0-9]+)/g;

const pollTemplate = pollId => `
    <div id="bttv-poll-contain">
        <div class="title">
            New poll available! 
            <span style="text-decoration: underline;">Vote now!</span>
        </div>
        <div class="close">
            <svg class="svg-close" height="16px" version="1.1" viewbox="0 0 16 16" width="16px" x="0px" y="0px">
                <path clip-rule="evenodd"
                      d="M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z"
                      fill-rule="evenodd" />
            </svg>
        </div>
        <iframe class="frame" src="https://www.strawpoll.me/embed_2/${pollId}"></iframe>
    </div>
`;

let frameTimeout = null;
let lastPollId = null;

class ChatEmbeddedPollModule {
    constructor() {
        watcher.on('chat.message', ($el, messageObj) => this.onChat($el, messageObj));
    }

    onChat($el, messageObj) {
        const strawpoll = STRAWPOLL_REGEX.exec(messageObj.message);

        if (!strawpoll || !messageObj.labels || !(messageObj.labels.includes('mod') || messageObj.labels.includes('owner'))) return;

        const pollId = strawpoll[1];

        let $poll = $('#bttv-poll-contain');

        // Dont replace the poll with the same one
        if ($poll.length && pollId === lastPollId) return;

        // If poll exists and there's an iframe open, don't do anything.
        if ($poll.length && $poll.children('.frame').is(':visible')) return;

        // Otherwise, if the poll exists delete the poll
        if ($poll.length) $poll.remove();

        // Push new poll to DOM
        $('.ember-chat .chat-room').append(pollTemplate(pollId));

        // Reset $poll to newly created poll
        $poll = $('#bttv-poll-contain');

        // If timeout exists already, clear it
        if (frameTimeout !== null) {
            clearTimeout(frameTimeout);
        }

        // After 30 seconds, remove poll if user doesn't open it
        frameTimeout = setTimeout(() => {
            if ($poll && !$poll.children('.frame').is(':visible')) $poll.remove();
        }, 30000);

        // User manually closes the poll
        $poll.children('.close').on('click', () => {
            $poll.remove();
        });

        // User opens the poll
        $poll.children('.title').on('click', () => {
            $poll.children('.frame').show();
            $poll.children('.title').text('Thanks!');
            $poll.css('height', '450px');
        });

        $poll.slideDown(200);

        lastPollId = pollId;
    }
}

module.exports = new ChatEmbeddedPollModule();
