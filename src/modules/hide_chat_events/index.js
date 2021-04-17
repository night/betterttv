import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';

class HideChatEventsModule {
    constructor() {
        settings.add({
            id: 'hideNewViewerGreeting',
            name: 'Hide New Viewer Greeting',
            defaultValue: false,
            description: 'Hides the new viewer greeting message from the chat'
        });
        settings.add({
            id: 'hideSubscriptionNotices',
            name: 'Hide Subscription and Resubscription notices',
            defaultValue: false,
            description: 'Hides subs, re-subs, and gift subs from the chat'
        });

        watcher.on('chat.message.handler', message => {
            this.handleMessage(message);
        });
    }

    handleMessage({message, preventDefault}) {
        switch (message.type) {
            case twitch.TMIActionTypes.RITUAL:
                if (settings.get('hideNewViewerGreeting')) {
                    preventDefault();
                }
                break;
            case twitch.TMIActionTypes.SUBSCRIPTION:
            case twitch.TMIActionTypes.RESUBSCRIPTION:
            case twitch.TMIActionTypes.SUBGIFT:
                if (settings.get('hideSubscriptionNotices')) {
                    preventDefault();
                }
                break;
        }
    }
}

export default new HideChatEventsModule();
