const settings = require('../../settings');
const watcher = require('../../watcher');
const $ = require('jquery');

const filterPanelTemplate = () => `
    <div id="liveFilterSelect">
        <label class="tw-c-text-base tw-strong">Filter</label>
        <select id="liveFilterSelectList">
            <option value="All">All</option>
        </select>
    </div>
`;

class DirectoryFilterLiveModule {
    constructor() {
        settings.add({
            id: 'showLiveFilter',
            name: 'Filter Live Channels by Game',
            defaultValue: false,
            description: 'Allows for filtering followed live Channels by game.'
        });
        watcher.on('load.directory.following.live', () => this.load());
    }

    load(retries = 0) {
        if (settings.get('showLiveFilter') === false || retries > 10) return;

        const liveHeader = $('.tw-mg-b-2').find('h4:contains("Live channels")').css('display', 'inline').parent();
        if (!liveHeader.length) {
            return setTimeout(() => this.load(retries + 1), 250);
        }

        const panel = document.createElement('div');
        panel.setAttribute('id', 'bttvLiveFilterPanel');
        panel.innerHTML = filterPanelTemplate();
        liveHeader.append(panel);

        const games = [];

        $('.live-channel-card a[href*="/game/"]').each(function() {
            if (games.indexOf($(this).text()) === -1) {
                games.push($(this).text());
            }
        });

        games.sort().forEach(game => {
            $('#liveFilterSelectList').append($('<option/>', {
                value: game,
                text: game
            }));
        });

        $('#liveFilterSelectList').on('change', function() {
            if (this.value === 'All') {
                $('.live-channel-card').parent().show();
            } else {
                $('.live-channel-card').parent().hide();
                $('.live-channel-card a[href*="/game/"]:contains("' + this.value + '")').closest('.live-channel-card').parent().show();
            }
        });
    }
}

module.exports = new DirectoryFilterLiveModule();
