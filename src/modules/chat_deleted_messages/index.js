const watcher = require('../../watcher');
const settings = require('../../settings');

class ChatDeletedMessagesModule {
    constructor() {
        settings.add({
            id: 'showDeletedMessages',
            name: 'Show Deleted Messages',
            defaultValue: false,
            description: 'Turn this on to change <message deleted> back to users\' messages.'
        });
        settings.add({
            id: 'hideDeletedMessages',
            name: 'Remove Deleted Messages',
            defaultValue: false,
            description: 'Completely removes timed out messages from view'
        });
        watcher.on('chat.message.deleted', ($element, emberView) => this.onMessage($element, emberView));
    }

    onMessage($element, emberView) {
        if (settings.get('hideDeletedMessages') === true) {
            $element.hide();
            return;
        }

        if (settings.get('showDeletedMessages') === false) return;
        emberView.set('msgObject.deleted', 0);
        $element.find('.message').addClass('bttv-deleted');
    }
}

module.exports = new ChatDeletedMessagesModule();
