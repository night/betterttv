const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

function setHeaderHeight(height) {
    const channelDiv = $('.cn-content').parent();
    if (channelDiv.length === 0) return;

    const viewRegistry = App.__container__.lookup('-view-registry:main');
    const channelRedesign = viewRegistry[channelDiv[0].id];
    if (!channelRedesign) return;

    channelRedesign.set('channelCoverHeight', height);

    const layoutService = App.__container__.lookup('service:layout');
    if (layoutService) layoutService.set('channelCoverHeight', height);

    $('.cn-cover.ember-view').height(height);
    $('.js-main-col-scroll-content').scrollTop(1);
    setTimeout(() => $('.js-main-col-scroll-content').scrollTop(0));
}

function updatePlayerPosition() {
    const playerPlaceholder = $('.player-placeholder');
    const persistentPlayer = App.__container__.lookup('service:persistentPlayer');
    if (playerPlaceholder.length === 0 || !persistentPlayer) return;

    const scrollParent = $('.js-main-col-scroll-content');
    const offset = playerPlaceholder.offset();

    persistentPlayer.set('fullSizePlayerLocation', {
        top: offset.top + scrollParent.scrollTop(),
        left: offset.left - scrollParent.offset().left
    });
}

let disabled = false;

class DisableChannelHeaderModule {
    constructor() {
        settings.add({
            id: 'disableChannelHeader',
            name: 'Disable Channel Header',
            defaultValue: false,
            description: 'Disables the large header on top of channels'
        });
        settings.on('changed.disableChannelHeader', () => this.load());
        watcher.on('load.channel', () => this.load());
    }

    load() {
        if (settings.get('disableChannelHeader') === true) {
            setHeaderHeight(0);
            disabled = true;
        } else if (disabled === true) {
            setHeaderHeight(380);
            disabled = false;
        }

        setTimeout(updatePlayerPosition);
    }
}

module.exports = new DisableChannelHeaderModule();
