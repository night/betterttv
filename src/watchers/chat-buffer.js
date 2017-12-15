const twitch = require('../utils/twitch');
const watcher = require('../watcher');

const PATCHED_SYMBOL = Symbol();

let twitchConsumeChatEvent;

function bttvConsumeChatEvent(event) {
    if (event && typeof event.type === 'number') {
        let isPrevented = false;
        watcher.emit('chat.buffer.event', {
            event,
            preventDefault: () => {
                isPrevented = true;
            }
        });
        if (isPrevented) return;
    }

    return twitchConsumeChatEvent.call(this, ...arguments);
}

function patchChatController() {
    const chatBuffer = twitch.getChatController().chatBuffer;
    if (!chatBuffer) return;

    const newTwitchConsumeChatEvent = chatBuffer.consumeChatEvent;
    if (
        chatBuffer._bttvConsumeChatEventPatched === PATCHED_SYMBOL ||
        newTwitchConsumeChatEvent === bttvConsumeChatEvent
    ) {
        return;
    }

    chatBuffer.consumeChatEvent = bttvConsumeChatEvent;
    chatBuffer._bttvConsumeChatEventPatched = PATCHED_SYMBOL;
    twitchConsumeChatEvent = newTwitchConsumeChatEvent;
}

function makeGetChannelModerators() {
    const DO_NOTHING = () => {};
    let captureEvent = DO_NOTHING;

    watcher.on('chat.buffer.event', eventObj => {
        if (eventObj.event.type === twitch.TMIActionTypes.ROOM_MODS) {
            captureEvent(eventObj);
        }
    });

    return channelName => new Promise((resolve, reject) => {
        if (!channelName) {
            channelName = twitch.getCurrentChannel().name;
        }
        const timeout = setTimeout(() => {
            captureEvent = DO_NOTHING;
            reject(new Error(`Can't get channel ${channelName} moderators.`));
        }, 500);

        captureEvent = ({event, preventDefault}) => {
            preventDefault();
            captureEvent = DO_NOTHING;
            clearTimeout(timeout);
            resolve(event.moderatorLogins);
        };

        twitch.getChatServiceSocket().send(`PRIVMSG #${channelName} : /mods`);
    });
}

class ChatBufferWatcher {
    constructor() {
        watcher.on('load.chat', () => patchChatController());
        this.extendTwitch();
    }

    extendTwitch() {
        twitch.getChannelModerators = makeGetChannelModerators();
    }
}

module.exports = new ChatBufferWatcher();
