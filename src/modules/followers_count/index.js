const $ = require('jquery');
const twitchAPI = require('../../utils/twitch-api');
const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const settings = require('../../settings');

const anchorSelector = '.channel-info-bar__viewers-wrapper';

const getFollowersCountHTML = followers => `
    <div id="bttv-followers-count" class="tw-inline-flex tw-relative tw-tooltip-wrapper" style="margin-right:.5rem">
        <div class="tw-align-items-center tw-inline-flex tw-stat">
            <div class="tw-align-items-center tw-inline-flex tw-stat__icon">
                <div class="tw-align-items-center tw-full-width tw-icon tw-inline-flex">
                    <div class="tw-aspect tw-aspect--align-top"><div class="tw-aspect__spacer" style="padding-bottom: 100%;"></div>
                        <svg class="tw-icon__svg tw-svg__asset tw-svg__asset--heart tw-svg__asset--inherit" version="1.1" viewBox="0 0 20 20" x="0px" y="0px"><g><path d="M9.171 4.171A4 4 0 006.343 3H6a4 4 0 00-4 4v.343a4 4 0 001.172 2.829L10 17l6.828-6.828A4 4 0 0018 7.343V7a4 4 0 00-4-4h-.343a4 4 0 00-2.829 1.172L10 5l-.829-.829z" fill-rule="evenodd" clip-rule="evenodd"></path></g></svg>
                    </div>
                </div>
            </div>
            <div data-a-target="tw-stat-value" class="tw-mg-l-05 tw-stat__value">${followers}</div>
        </div>
        <div class="tw-tooltip tw-tooltip--align-center tw-tooltip--down" data-a-target="tw-tooltip-label" role="tooltip">Followers</div>
    </div>
`;

class FollowersCount {
    constructor() {
        settings.add({
            id: 'enableFollowersCount',
            name: 'Show Followers Count',
            defaultValue: false,
            description: 'Show the followers count next to the viewers/views count'
        });
        watcher.on('load.channel', () => this.load());
        settings.on('changed.enableFollowersCount', () => this.load());
    }

    load() {
        if (!settings.get('enableFollowersCount')) {
            $('#bttv-followers-count').remove();
            return;
        }

        const currentChannel = twitch.getCurrentChannel();

        twitchAPI.get(`channels/${currentChannel.id}`).then(({ followers }) => {
            const followersHTML = getFollowersCountHTML(Number(followers).toLocaleString());

            $(followersHTML).insertAfter(anchorSelector);
        });
    }
}

module.exports = new FollowersCount();
