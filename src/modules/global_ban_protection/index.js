const twitch = require('../../utils/twitch');

// Regular users are allowed 20 messages in 30 seconds, mods (and higher
// positions) 100 messages in 30 seconds, see
// https://discuss.dev.twitch.tv/t/message-limit-for-moderators/3042/4
const regularMsgLimit = 20;
const modMsgLimit = 100;
const timeLimit = 30;

class GlobalBanProtectionModule {
    constructor() {
        this.msgTimeStamps = new Array();
        // TODO: Check if user is moderator in current channel
        if (false) {
            this.msgLimit = modMsgLimit;
        } else {
            this.msgLimit = regularMsgLimit;
        }
    }

    onSendMessage(sendState) {
        // Clear collected time stamps older than timeLimit seconds as they are
        // no longer relevant for a global ban.
        while (true) {
            if (this.msgTimeStamps.length === 0) {
                break;
            }
            const oldestMsgTimeStamp = this.msgTimeStamps.shift();
            if ((Date.now() - oldestMsgTimeStamp) / 1000 <= timeLimit) {
                this.msgTimeStamps.unshift(oldestMsgTimeStamp);
                break;
            }
        }

        // At this point, this.msgTimeStamps.length is the number of messages
        // sent in the last timeLimit seconds. If there is room for another
        // message, collect its time stamp. Else, prevent the global ban.
        if (this.msgTimeStamps.length < this.msgLimit) {
            this.msgTimeStamps.push(Date.now());
        } else {
            twitch.sendChatAdminMessage('Sending messages too quickly, preventing global ban');
            sendState.preventDefault();
        }
    }
}

module.exports = new GlobalBanProtectionModule();
