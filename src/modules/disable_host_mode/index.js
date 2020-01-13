const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let oldHandleStreamChatRoomHostTargetChange;
function newHandleStreamChatRoomHostTargetChange() {
    if (settings.get('disableHostMode')) return null;
    return oldHandleStreamChatRoomHostTargetChange.call(this, ...arguments);
}

let oldFetchPubsubHostedChannel;
function newFetchPubsubHostedChannel() {
    if (settings.get('disableHostMode')) return null;
    return oldFetchPubsubHostedChannel.call(this, ...arguments);
}

class DisableHostModeModule {
    constructor() {
        settings.add({
            id: 'disableHostMode',
            name: 'Disable Host Mode',
            defaultValue: false,
            description: 'Disables hosted channels on Twitch'
        });
        settings.on('changed.disableHostMode', () => this.load());
        watcher.on('load.chat', () => this.load());
    }

    load() {
        if (!settings.get('disableHostMode')) return;

        const channelHostingContext = twitch.getChannelHostingContext();
        if (!channelHostingContext) return;

        if (channelHostingContext._bttvPatched) return;
        channelHostingContext._bttvPatched = true;

        if (channelHostingContext.handleStreamChatRoomHostTargetChange && channelHostingContext.handleStreamChatRoomHostTargetChange !== newHandleStreamChatRoomHostTargetChange) {
            oldHandleStreamChatRoomHostTargetChange = channelHostingContext.handleStreamChatRoomHostTargetChange;
            channelHostingContext.handleStreamChatRoomHostTargetChange = newHandleStreamChatRoomHostTargetChange;
        }

        if (channelHostingContext.fetchPubsubHostedChannel && channelHostingContext.fetchPubsubHostedChannel !== newFetchPubsubHostedChannel) {
            oldFetchPubsubHostedChannel = channelHostingContext.fetchPubsubHostedChannel;
            channelHostingContext.fetchPubsubHostedChannel = newFetchPubsubHostedChannel;
        }

        channelHostingContext.setState({
            videoPlayerSource: channelHostingContext.props.match.params.channelLogin,
            hostedChannel: null
        });
    }
}

module.exports = new DisableHostModeModule();
