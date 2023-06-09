import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';
import ModeratorCard from './moderator-card.js';

let openModeratorCard;

class ChatModeratorCardsModule {
  constructor() {
    watcher.on('chat.moderator_card.open', (element) => this.onOpen(element));
    watcher.on('chat.moderator_card.close', () => this.onClose());
    document.body.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  onOpen(element) {
    const targetUser = twitch.getChatModeratorCardUser(element);
    if (!targetUser) return;

    if (openModeratorCard && openModeratorCard.user.id === targetUser.id) {
      return;
    }

    this.onClose();

    let isOwner = false;
    let isModerator = false;
    const userMessages = twitch.getChatMessages(targetUser.id);
    if (userMessages.length) {
      const {message} = userMessages[userMessages.length - 1];
      isOwner = twitch.getUserIsOwnerFromTagsBadges(message.badges);
      isModerator = twitch.getUserIsModeratorFromTagsBadges(message.badges);
    }

    openModeratorCard = new ModeratorCard(
      element,
      {
        id: targetUser.id,
        name: targetUser.login,
        isOwner,
        isModerator,
      },
      userMessages,
      () => this.onClose(false)
    );
    openModeratorCard.render();
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

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatModeratorCardsModule()]);
