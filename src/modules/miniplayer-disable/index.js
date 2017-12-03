const $ = require('jquery');
const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');

const MINIPLAYER_DISMISS = '[data-test-selector=persistent-player-mini-dismiss]';

function dismiss(shouldDismiss = true) {
    if (!shouldDismiss) return;
    if ($(MINIPLAYER_DISMISS)[0]) {
        if (!settings.get('disableMiniplayer')) return;
        $(MINIPLAYER_DISMISS).click();
        debug.log('[Miniplayer] Auto dismissed');
    }
}

class MiniplayerDisableModule {
    constructor() {
        settings.add({
            id: 'disableMiniplayer',
            name: 'Disable Miniplayer',
            defaultValue: false,
            description: 'Disable the Miniplayer when leaving the channel'
        });

        watcher.on('load', () => setTimeout(dismiss, 25));
        settings.on('changed.disableMiniplayer', dismiss);
    }
}

module.exports = new MiniplayerDisableModule();
