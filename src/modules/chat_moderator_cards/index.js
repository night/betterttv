const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const ModeratorCard = require('./moderator-card');

let openModeratorCard;

function getUserMessages(name) {
    return Array.from($('.chat-line__message'))
        .reverse()
        .map(el => {
            return {
                message: twitch.getChatMessageObject(el),
                outerHTML: el.outerHTML
            };
        })
        .filter(({message}) => message && message.user && message.user.userLogin === name);
}

class ChatModeratorCardsModule {
    constructor() {
        watcher.on('chat.moderator_card.open', $element => this.onOpen($element));
        watcher.on('chat.moderator_card.close', () => this.onClose());
        $('body').on('keydown.modCard', e => this.onKeyDown(e));
    }

    onOpen($element) {
        const props = twitch.getChatModeratorCardProps($element[0]);
        if (!props) return;

        const {data} = props;

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

        dataFetcher.then(targetUser => {
            if (openModeratorCard && openModeratorCard.user.id === targetUser.id) {
                return;
            }

            this.onClose();

            let isOwner = false;
            let isModerator = false;
            const userMessages = getUserMessages(targetUser.login);
            if (userMessages.length) {
                const {message} = userMessages[userMessages.length - 1];
                isOwner = twitch.getUserIsOwnerFromTagsBadges(message.badges);
                isModerator = twitch.getUserIsModeratorFromTagsBadges(message.badges);
            }

            openModeratorCard = new ModeratorCard(
                $element,
                {
                    id: targetUser.id,
                    name: targetUser.login,
                    isOwner,
                    isModerator
                },
                userMessages,
                () => this.onClose(false)
            );
            openModeratorCard.render();
        });
    }

    onClose(cleanup = true) {
        if (cleanup && openModeratorCard) {
            openModeratorCard.cleanup();
        }
        openModeratorCard = null;
    }

    onKeyDown(e) {
        if (!openModeratorCard) return;
        openModeratorCard.onKeyDown(e);
    }
}


module.exports = new ChatModeratorCardsModule();
