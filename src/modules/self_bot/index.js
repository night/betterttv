import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {messageTextFromAST} from '@/utils/chat-message-text';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import watcher from '@/watcher';
import {computeSelfBotCommands, matchesCommand, matchesUserLevel} from './commands';

const COMMAND_COOLDOWN_MS = 2000;
// only one session per user may hold this lock, ensuring a single session replies
const SELF_BOT_SESSION_LOCK = 'self_bot';

let computedCommands = [];
const commandCooldowns = new Map();
let loadTime = Date.now();

function recomputeCommands() {
  computedCommands = computeSelfBotCommands(settings.get(SettingIds.SELF_BOT_COMMANDS_LIST));
}

function isSelfBotActive() {
  return (
    settings.get(SettingIds.SELF_BOT) && useAuthStore.getState().user != null && twitch.getCurrentUserIsOwner() === true
  );
}

// claim the lock while we are actively self-botting our own channel, release it otherwise
// so another session can take over
function updateSessionLock() {
  if (isSelfBotActive()) {
    socketClient.ensureAuthentication();
    socketClient.acquireSessionLock(SELF_BOT_SESSION_LOCK);
  } else {
    socketClient.releaseSessionLock(SELF_BOT_SESSION_LOCK);
  }
}

function isOnCooldown(command) {
  const lastTriggered = commandCooldowns.get(command);
  if (lastTriggered == null) {
    return false;
  }

  return Date.now() - lastTriggered < COMMAND_COOLDOWN_MS;
}

function setCooldown(command) {
  commandCooldowns.set(command, Date.now());
}

class SelfBotModule {
  constructor() {
    watcher.on('load.chat', () => {
      loadTime = Date.now();
      recomputeCommands();
      updateSessionLock();
    });
    watcher.on('chat.message', (_, messageObj) => this.onMessage(messageObj));
    settings.on(`changed.${SettingIds.SELF_BOT_COMMANDS_LIST}`, recomputeCommands);
    settings.on(`changed.${SettingIds.SELF_BOT}`, () => {
      recomputeCommands();
      updateSessionLock();
    });
    useAuthStore.subscribe((state) => state.user, updateSessionLock);

    recomputeCommands();
    updateSessionLock();
  }

  onMessage(messageObj) {
    if (!settings.get(SettingIds.SELF_BOT)) {
      return;
    }

    if (useAuthStore.getState().user == null) {
      return;
    }

    if (!twitch.getCurrentUserIsOwner()) {
      return;
    }

    // another session holds the lock and is responsible for replying
    if (!socketClient.hasSessionLock(SELF_BOT_SESSION_LOCK)) {
      return;
    }

    const {user, login, messageParts, timestamp, badges} = messageObj;
    if (timestamp == null || timestamp <= loadTime) {
      return;
    }

    // don't reply to other chat bots (Twitch flags them with a bot badge)
    if (badges?.['bot-badge'] != null) {
      return;
    }

    const currentUser = getCurrentUser();
    if (user == null && login == null) {
      return;
    }

    const from = login ?? user.userLogin;
    if (currentUser != null && from.toLowerCase() === currentUser.name.toLowerCase()) {
      return;
    }

    if (messageParts == null) {
      return;
    }

    const messageText = messageTextFromAST(messageParts);

    for (const command of computedCommands) {
      if (isOnCooldown(command.command)) {
        continue;
      }

      if (!matchesCommand(command, messageText)) {
        continue;
      }

      if (!matchesUserLevel(command.userLevel, messageObj)) {
        continue;
      }

      setCooldown(command.command);
      twitch.sendChatMessage(command.response, {replyParentMessage: messageObj});
      return;
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SelfBotModule()]);
