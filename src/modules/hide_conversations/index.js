const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

const CONVERSATION_CLASS = '.conversations-content';

function slideDown() {
    var $conversations = $(CONVERSATION_CLASS);

    if ($conversations.find('.list-displayed').length || $conversations.find('.conversation-window').length) return;

    $conversations.animate({bottom: '-26px'}, 100);
}

function slideUp() {
    var $conversations = $(CONVERSATION_CLASS);

    $conversations.animate({bottom: '0px'}, 100);
}

class HideConversations {
    constructor() {
        settings.add({
            id: 'disableWhispers',
            name: 'Hide Whispers',
            defaultValue: false,
            description: 'Disables the Twitch whisper feature and hides any whispers you receive'
        });
        settings.add({
            id: 'hideConversations',
            name: 'Hide Whispers When Inactive',
            defaultValue: false,
            description: 'Only show whispers on mouseover or when there\'s a new message'
        });
        settings.on('changed.disableWhispers', () => this.toggleHide());
        settings.on('changed.hideConversations', () => this.toggleAutoHide());
        watcher.on('load', () => {
            this.toggleHide();
            this.toggleAutoHide();
        });
        watcher.on('conversation.new', $el => this.onNewConversation($el));
    }

    toggleHide() {
        if (settings.get('disableWhispers') === true) {
            $(CONVERSATION_CLASS).hide();
        } else {
            $(CONVERSATION_CLASS).show();
        }
    }

    onNewConversation($el) {
        if (!settings.get('hideConversations')) return;

        slideUp();
        $el.find('.convoHeader__buttons')
            .children()
            .last()
            .on('click', () => setTimeout(slideDown, 100));
    }

    toggleAutoHide() {
        var $conversations = $(CONVERSATION_CLASS);

        if (settings.get('hideConversations')) {
            slideDown();

            $conversations.on({
                mouseenter: slideUp,
                mouseleave: slideDown
            });
        } else {
            slideUp();

            $conversations.off({
                mouseenter: slideUp,
                mouseleave: slideDown
            });
        }
    }
}

module.exports = new HideConversations();
