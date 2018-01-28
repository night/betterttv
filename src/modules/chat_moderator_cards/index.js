const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const ModeratorCard = require('./moderator-card');

let openModeratorCard;

class ChatModeratorCardsModule {
    constructor() {
        watcher.on('chat.moderator_card.open', $element => this.onOpen($element));
        watcher.on('chat.moderator_card.close', () => this.onClose());
        $('body').on('keydown.modCard', e => this.onKeyDown(e));
    }

    onOpen($element) {
        const props = twitch.getChatModeratorCardProps($element[0]);
        if (!props) return;

        const {sourceID, data} = props;

        let dataFetcher;
        if (data.targetUser) {
            dataFetcher = Promise.resolve(data.targetUser);
        } else {
            dataFetcher = props.data.refetch().then(({data: {targetUser}}) => {
                if (!targetUser) {
                    return Promise.reject('no target user in data');
                }

                return targetUser;
            });
        }

        let isOwner = false;
        let isModerator = false;
        if (sourceID) {
            const connectRoot = twitch.getConnectRoot();
            if (!connectRoot) return;
            const {chat: {messages}} = connectRoot._context.store.getState();
            const currentChannel = twitch.getCurrentChannel();
            if (!currentChannel) return;
            const channelMessages = messages[currentChannel.name];
            if (!channelMessages) return;
            const message = channelMessages.find(({id}) => id === sourceID);
            if (message) {
                isOwner = twitch.getUserIsOwnerFromTagsBadges(message.badges);
                isModerator = twitch.getUserIsModeratorFromTagsBadges(message.badges);
            }
        }

        dataFetcher.then(targetUser => {
            openModeratorCard = new ModeratorCard($element, {
                id: targetUser.id,
                name: targetUser.login,
                isOwner,
                isModerator
            });
            openModeratorCard.render();
        });
    }

    onClose() {
        openModeratorCard = null;
    }

    onKeyDown(e) {
        if (!openModeratorCard) return;
        openModeratorCard.onKeyDown(e);
    }
}


module.exports = new ChatModeratorCardsModule();
