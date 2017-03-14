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
