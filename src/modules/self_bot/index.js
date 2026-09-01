import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import {messageTextFromAST} from '@/utils/chat-message-text';
import {loadModuleForPlatforms} from '@/utils/modules';
import {isUserPro} from '@/utils/pro';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import watcher from '@/watcher';
import {computeSelfBotCommands, matchesCommand, matchesUserLevel} from './commands';
import {computeSelfBotTimers} from './timers';

const COMMAND_COOLDOWN_MS = 2000;
const TIMER_TICK_INTERVAL_MS = 15 * 1000;
// only one session per user may hold this lock, ensuring a single session replies
const SELF_BOT_SESSION_LOCK = 'self_bot';

let computedCommands = [];
const commandCooldowns = new Map();
let loadTime = Date.now();

let computedTimers = [];
// timer id -> {time, lineCount} anchored when the timer last sent, or when it
// was first seen
const timerSendAnchors = new Map();
// external chat lines seen while timers are scheduled
let chatLineCount = 0;
let timersTickInterval = null;

function recomputeCommands() {
  computedCommands = computeSelfBotCommands(settings.get(SettingIds.SELF_BOT_COMMANDS_LIST));
}

function recomputeTimers() {
  computedTimers = computeSelfBotTimers(settings.get(SettingIds.SELF_BOT_TIMERS_LIST));
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

function sendDueTimerMessage() {
  if (!isSelfBotActive() || !isUserPro(useAuthStore.getState().user)) {
    return;
  }

  // another session holds the lock and is responsible for sending
  if (!socketClient.hasSessionLock(SELF_BOT_SESSION_LOCK)) {
    return;
  }

  const now = Date.now();

  let dueTimer = null;
  let dueTime = null;

  for (const timer of computedTimers) {
    const anchor = timerSendAnchors.get(timer.id);

    // an unseen timer starts counting from the first tick it is observed on,
    // so activation and mid-run additions both wait a full interval to send
    if (anchor == null) {
      timerSendAnchors.set(timer.id, {time: now, lineCount: chatLineCount});
      continue;
    }

    if (now - anchor.time < timer.intervalMinutes * 60 * 1000) {
      continue;
    }

    // dead chat guard: the required chat lines are counted since the timer
    // last sent, so a due timer holds until chat catches up rather than
    // skipping a full interval
    if (chatLineCount - anchor.lineCount < timer.lines) {
      continue;
    }

    // send at most one message per tick, most overdue first, to avoid bursts
    if (dueTime == null || anchor.time < dueTime) {
      dueTimer = timer;
      dueTime = anchor.time;
    }
  }

  if (dueTimer == null) {
    return;
  }

  timerSendAnchors.set(dueTimer.id, {time: now, lineCount: chatLineCount});
  twitch.sendChatMessage(dueTimer.message);
}

// a real viewer message: sent after load, not from a chat bot (Twitch flags
// those with a bot badge), and not from the current user themselves
function isExternalChatMessage(messageObj) {
  const {user, login, timestamp, badges} = messageObj;
  if (timestamp == null || timestamp <= loadTime) {
    return false;
  }

  if (badges?.['bot-badge'] != null) {
    return false;
  }

  const from = login ?? user?.userLogin;
  if (from == null) {
    return false;
  }

  const currentUser = getCurrentUser();
  if (currentUser != null && from.toLowerCase() === currentUser.name.toLowerCase()) {
    return false;
  }

  return true;
}

function countTimerChatLine(messageObj) {
  // timersTickInterval doubles as "timers are currently scheduled"
  if (timersTickInterval == null) {
    return;
  }

  if (!isExternalChatMessage(messageObj)) {
    return;
  }

  chatLineCount += 1;
}

function updateTimersSchedule() {
  const shouldRun = isSelfBotActive() && isUserPro(useAuthStore.getState().user) && computedTimers.length > 0;

  if (shouldRun && timersTickInterval == null) {
    timersTickInterval = setInterval(sendDueTimerMessage, TIMER_TICK_INTERVAL_MS);
  } else if (!shouldRun && timersTickInterval != null) {
    clearInterval(timersTickInterval);
    timersTickInterval = null;
    // countdowns and chat activity do not survive deactivation
    timerSendAnchors.clear();
    chatLineCount = 0;
  }
}

function updateSelfBotState() {
  updateSessionLock();
  updateTimersSchedule();
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
      recomputeTimers();
      updateSelfBotState();
    });
    watcher.on('chat.message', (_, messageObj) => {
      countTimerChatLine(messageObj);
      this.onMessage(messageObj);
    });
    settings.on(`changed.${SettingIds.SELF_BOT_COMMANDS_LIST}`, recomputeCommands);
    settings.on(`changed.${SettingIds.SELF_BOT_TIMERS_LIST}`, () => {
      recomputeTimers();
      updateTimersSchedule();
    });
    settings.on(`changed.${SettingIds.SELF_BOT}`, () => {
      recomputeCommands();
      recomputeTimers();
      updateSelfBotState();
    });
    useAuthStore.subscribe((state) => state.user, updateSelfBotState);

    recomputeCommands();
    recomputeTimers();
    updateSelfBotState();
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

    if (!isExternalChatMessage(messageObj)) {
      return;
    }

    const {messageParts} = messageObj;
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
