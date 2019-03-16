const $ = require('jquery');
const twitch = require('../../utils/twitch');
const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');

const CHAT_ROOM_NOTIFICATIONS_SELECTOR = '.chat-room__notifications';

class AutoLeaveRaid {
    constructor() {
        settings.add({
            id: 'autoLeaveRaid',
            name: 'Automatically Leave Raids',
            defaultValue: false,
            description: 'Automatically leaves raids'
        });
        watcher.on('load.chat', () => {
            this.autoLeaveRaidObserver();
        });
    }

    autoLeaveRaidObserver() {
        const observe = (_watcher, element) => {
            if (!element) return;
            if (_watcher) _watcher.disconnect();
            _watcher.observe(element, {childList: true, subtree: true});
        };

        const autoLeaveRaidWatcher = new window.MutationObserver(mutations => {
            if (!settings.get('autoLeaveRaid')) {
                return;
            }

            mutations.forEach(mutation => {
                for (const el of mutation.addedNodes) {
                    if (el.getAttribute('data-test-selector') === 'raid-banner') {
                        const raidContext = twitch.getChannelRaidContext($('.room-selector').get(0));

                        if (raidContext) {
                            raidContext.handleLeaveRaid();
                        } else {
                            debug.log('Couldn\'t find raidContext - autoLeaveRaid module');
                        }
                    }
                }
            });
        });

        observe(autoLeaveRaidWatcher, $(CHAT_ROOM_NOTIFICATIONS_SELECTOR)[0]);
    }
}

module.exports = new AutoLeaveRaid();
