const settings = require('../../settings');
const $ = require('jquery');

class HideNewViewerGreetingModule {
    constructor() {
        settings.add({
            id: 'hideNewViewerGreeting',
            name: 'Hide New Viewer Greeting',
            defaultValue: false,
            description: 'Hides the new viewer greeting message from the chat'
        });
        settings.on('changed.hideNewViewerGreeting', () => this.toggleNewViewerGreeting());
        this.toggleNewViewerGreeting();
    }

    toggleNewViewerGreeting() {
        $('body').toggleClass('bttv-hide-new-viewer-greeting', settings.get('hideNewViewerGreeting'));
    }
}

module.exports = new HideNewViewerGreetingModule();
