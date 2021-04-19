const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const domObserver = require('../../observers/dom');

let removeHostingIndicatorListener;

function pauseVideo() {
    let interval;

    const timeoutInterval = setTimeout(() => interval && clearInterval(interval), 10000);

    interval = setInterval(() => {
        const currentPlayer = twitch.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isLoaded) return;
        currentPlayer.pause();

        clearInterval(interval);
        interval = undefined;
        clearTimeout(timeoutInterval);
    }, 100);
}

class DisableHostModeAutoplayModule {
    constructor() {
        settings.add({
            id: 'disableHostMode',
            name: 'Disable Host Mode Autoplay',
            defaultValue: false,
            description: 'Disables autoplay during channel hosting'
        });
        settings.on('changed.disableHostMode', () => this.load());
        watcher.on('load', () => this.load());
    }

    load() {
        if (settings.get('disableHostMode')) {
            if (removeHostingIndicatorListener) return;

            removeHostingIndicatorListener = domObserver.on(
                '.tw-align-items-center a[data-a-target="hosting-ui-link"], .metadata-layout__secondary-button-spacing a[data-a-target="hosting-ui-link"], .channel-status-info--hosting',
                (node, isConnected) => {
                    if (!isConnected) return;
                    pauseVideo();
                }
            );
            return;
        }

        if (!removeHostingIndicatorListener) return;

        removeHostingIndicatorListener();
        removeHostingIndicatorListener = undefined;
    }
}

module.exports = new DisableHostModeAutoplayModule();
