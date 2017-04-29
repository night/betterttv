const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');

class ColumnToggleHotkeyModule {
    constructor() {
        settings.add({
            id: 'columnToggleHotkey',
            name: 'Column Toggle Hotkey',
            defaultValue: false,
            description: 'Enables CTRL+LEFT and CTRL+RIGHT hide / show left and right columns'
        });
        watcher.on('load', () => this.load());
    }

    load() {
        if (settings.get('columnToggleHotkey') === false) return;

        try {
            $(document).keydown(e => {
                if (e.ctrlKey) {
                    if (e.which === 37) {
                        // Check if you're in theater mode, don't click left one if you are
                        // because it has no visual effect, but **is** clicking it in the background
                        const container = App.__container__;
                        if ((container.lookup('service:persistentPlayer').playerComponent) &&
                            (container.lookup('service:persistentPlayer').playerComponent.player.theatre)) {
                            return;
                        }

                        $('#left_close').click();
                    } else if (e.which === 39) {
                        $('#right_close').click();
                    }
                }
            });
        } catch (e) {
            debug.log('Error with column toggle hotkey: ', e);
        }
    }
}

module.exports = new ColumnToggleHotkeyModule();
