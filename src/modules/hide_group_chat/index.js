const settings = require('../../settings');
const css = require('../../utils/css');

class HideGroupChatModule {
    constructor() {
        settings.add({
            id: 'groupChatRemoval',
            name: 'Hide Group Chat',
            defaultValue: false,
            description: 'Hides the group chat bar above chat'
        });
        settings.on('changed.groupChatRemoval', value => value === true ? this.load() : this.unload());
        if (settings.get('groupChatRemoval') === true) this.load();
    }

    load() {
        css.load('hide-group-chat');
    }

    unload() {
        css.unload('hide-group-chat');
    }
}

module.exports = new HideGroupChatModule();
