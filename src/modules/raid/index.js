const settings = require('../../settings');
const watcher = require('../../watcher');

class RaidModule {
    constructor() {
        settings.add({
            id: 'replaceRaidUrl',
            name: 'Replace URL after raid',
            defaultValue: true,
            description: 'Removes referrer=raid from the URL after raids'
        });

        watcher.on('load', () => this.reloadPage());
    }

    /* This function is called whenever something is loaded,
    making sure that as soon as something loads, the module checks
    to redirect from raids
    */
    reloadPage() {
        if (settings.get('replaceRaidUrl')) {
            if (window.location.href.includes('referrer=raid')) {
                // Redirect to normal channel URL
                window.location.href = window.location.href.replace('referrer=raid', '');
            }
        }
    }
}

module.exports = new RaidModule();
