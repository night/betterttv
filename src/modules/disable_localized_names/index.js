const settings = require('../../settings');
const watcher = require('../../watcher');

class DisableLocalizedNamesModule {
    constructor() {
        settings.add({
            id: 'disableLocalizedNames',
            name: 'Disable Localized Names',
            defaultValue: false,
            description: 'Show usernames instead of localized names in chat'
        });
        watcher.on('chat.message', $el => this.delocalizeName($el));
    }

    delocalizeName($el) {
        if (settings.get('disableLocalizedNames') === false) return;

        const $name = $el.find('.from');
        const $login = $name.find('.intl-login');
        if (!$login.length) return;

        $name.text($login.text().replace(/[\(\)]/g, ''));
    }
}

module.exports = new DisableLocalizedNamesModule();
