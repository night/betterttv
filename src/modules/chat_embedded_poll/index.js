const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

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
        <iframe class="frame" src="https://www.strawpoll.me/embed_1/${pollId}"></iframe>
    </div>
`;

let frameTimeout = null;
let lastPollId = null;

class ChatEmbeddedPollModule {
    constructor() {
        watcher.on('chat.message', ($el, messageObj) => this.onChat($el, messageObj));
    }

    onChat($el, messageObj) {
        const strawpoll = STRAWPOLL_REGEX.exec($el.text());
        if (!strawpoll || !messageObj.badges) return;

        const isModerator = twitch.getUserIsModeratorFromTagsBadges(messageObj.badges);
        const isOwner = twitch.getUserIsOwnerFromTagsBadges(messageObj.badges);
        if (!isModerator && !isOwner) return;

        const pollId = strawpoll[1];

        let $poll = $('#bttv-poll-contain');
        if ($poll.length && pollId === lastPollId) return;
        if ($poll.length && $poll.children('.frame').is(':visible')) return;
        if ($poll.length) $poll.remove();

        $('.chat-list').append(pollTemplate(pollId));

        $poll = $('#bttv-poll-contain');

        if (frameTimeout !== null) {
            clearTimeout(frameTimeout);
        }

        frameTimeout = setTimeout(() => {
            if ($poll && !$poll.children('.frame').is(':visible')) $poll.remove();
        }, 30000);

        $poll.children('.close').on('click', () => {
            $poll.remove();
        });
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
