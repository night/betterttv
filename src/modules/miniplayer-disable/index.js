const $ = require('jquery');
const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');

const MINIPLAYER_CONTAINER = '[data-a-target=root-scroller]';
const MINIPLAYER_DISMISS = '[data-test-selector=persistent-player-mini-dismiss]';

class MiniplayerDisableModule {
    constructor() {
        settings.add({
            id: 'disableMiniplayer',
            name: 'Disable Miniplayer',
            defaultValue: false,
            description: 'Disable the Miniplayer when leaving the channel'
        });

        this.setupObserver();
    }

    setupObserver() {
        let miniplayerObserver = null;
        function observerHandler() {
            const $dismissMiniPlayer = $(MINIPLAYER_DISMISS);
            if ($dismissMiniPlayer[0]) {
                $dismissMiniPlayer.click();
                debug.log('[Miniplayer] Auto dismissed');
                miniplayerObserver.disconnect();
            }
        }

        function observe(element) {
            if (miniplayerObserver) miniplayerObserver.disconnect();
            if (!settings.get('disableMiniplayer')) return;
            if (!element) return;
            miniplayerObserver.observe(element, {childList: true, subtree: true});
            observerHandler();
        }

        miniplayerObserver = new window.MutationObserver(observerHandler);

        watcher.on('load.chat', () => observe($(MINIPLAYER_CONTAINER)[0]));
        settings.on('changed.disableMiniplayer', () => observe($(MINIPLAYER_CONTAINER)[0]));
    }
}

module.exports = new MiniplayerDisableModule();
