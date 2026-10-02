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
// background tabs throttle timers to one tick per minute; due sends then drain
// one per tick, which stays within the one-message-per-tick pacing below
const TIMER_TICK_INTERVAL_MS = 15 * 1000;
// mirrors nightbot: a timer's chat lines requirement counts messages in the last 5 minutes
const TIMER_CHAT_LINES_WINDOW_MS = 5 * 60 * 1000;
// only one session per user may hold this lock, ensuring a single session replies
const SELF_BOT_SESSION_LOCK = 'self_bot';

let computedCommands = [];
const commandCooldowns = new Map();
let loadTime = Date.now();

let computedTimers = [];
// timer id -> when the timer last completed a check: a send, a skipped
// (guard-failed) check, or when it was first seen
const timerLastCheckTimes = new Map();
// send times of recent non-broadcaster messages, pruned to the window
const recentChatLineTimes = [];
let timersTickInterval = null;

function recomputeCommands() {
  computedCommands = computeSelfBotCommands(settings.get(SettingIds.SELF_BOT_COMMANDS_LIST));
}

function recomputeTimers() {
  computedTimers = computeSelfBotTimers(settings.get(SettingIds.SELF_BOT_TIMERS_LIST));

  // a disabled, deleted, or invalidated timer loses its check time, so it waits
  // a full interval again when it comes back instead of firing immediately
  const timerIds = new Set(computedTimers.map((timer) => timer.id));
  for (const id of timerLastCheckTimes.keys()) {
    if (timerIds.has(id)) {
      continue;
    }

    timerLastCheckTimes.delete(id);
  }
}

function isSelfBotActive() {
  return (
    settings.get(SettingIds.SELF_BOT) && useAuthStore.getState().user != null && twitch.getCurrentUserIsOwner() === true
  );
}

// claim the lock while we are actively self-botting our own channel, release it otherwise
// so another session can take over
function updateSessionLock() {
  if (!isSelfBotActive()) {
    socketClient.releaseSessionLock(SELF_BOT_SESSION_LOCK);
    return;
  }

  socketClient.ensureAuthentication();
  socketClient.acquireSessionLock(SELF_BOT_SESSION_LOCK);
}

function sendDueTimerMessage() {
  if (!isSelfBotActive() || !isUserPro(useAuthStore.getState().user)) {
    return;
  }

  // another session holds the lock and is responsible for sending
  if (!socketClient.hasSessionLock(SELF_BOT_SESSION_LOCK)) {
    return;
  }

  // chat can be unmounted mid-navigation; hold check times so no interval is lost
  if (twitch.getCurrentChat() == null) {
    return;
  }

  // like nightbot, timers only run while the stream is live. clearing the check
  // times makes every timer wait a full interval once the stream goes live.
  if (!twitch.getCurrentChannelIsLive()) {
    timerLastCheckTimes.clear();
    return;
  }

  const now = Date.now();
  pruneRecentChatLines(now);

  let dueTimer = null;
  let dueTime = null;

  for (const timer of computedTimers) {
    const lastCheckTime = timerLastCheckTimes.get(timer.id);

    // an unseen timer starts counting from the first tick it is observed on,
    // so activation and mid-run additions both wait a full interval to send
    if (lastCheckTime == null) {
      timerLastCheckTimes.set(timer.id, now);
      continue;
    }

    const dueAt = lastCheckTime + timer.intervalMinutes * 60 * 1000;
    if (now < dueAt) {
      continue;
    }

    // dead chat guard, nightbot-style: the check runs once per interval, and a
    // failed check skips this interval entirely rather than retrying early
    if (recentChatLineTimes.length < timer.lines) {
      timerLastCheckTimes.set(timer.id, now);
      continue;
    }

    // send at most one message per tick, most overdue first, to avoid bursts
    if (dueTime == null || dueAt < dueTime) {
      dueTimer = timer;
      dueTime = dueAt;
    }
  }

  if (dueTimer == null) {
    return;
  }

  timerLastCheckTimes.set(dueTimer.id, now);
  twitch.sendChatMessage(dueTimer.message);
}

function pruneRecentChatLines(now) {
  while (recentChatLineTimes.length > 0 && now - recentChatLineTimes[0] > TIMER_CHAT_LINES_WINDOW_MS) {
    recentChatLineTimes.shift();
  }
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

function countTimerChatLine(isExternalMessage) {
  // timersTickInterval doubles as "timers are currently scheduled"
  if (timersTickInterval == null || !isExternalMessage) {
    return;
  }

  recentChatLineTimes.push(Date.now());
}

function updateTimersSchedule() {
  const shouldRun = isSelfBotActive() && isUserPro(useAuthStore.getState().user) && computedTimers.length > 0;

  if (shouldRun && timersTickInterval == null) {
    timersTickInterval = setInterval(sendDueTimerMessage, TIMER_TICK_INTERVAL_MS);
    return;
  }

  if (shouldRun || timersTickInterval == null) {
    return;
  }

  clearInterval(timersTickInterval);
  timersTickInterval = null;
  // countdowns and chat activity do not survive deactivation
  timerLastCheckTimes.clear();
  recentChatLineTimes.length = 0;
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
    watcher.on('chat.message', (_, messageObj) => this.handleChatMessage(messageObj));
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

  // computes the shared per-message checks once for both timers and commands
  handleChatMessage(messageObj) {
    if (!isSelfBotActive()) {
      return;
    }

    const isExternalMessage = isExternalChatMessage(messageObj);

    countTimerChatLine(isExternalMessage);
    this.onMessage(messageObj, isExternalMessage);
  }

  onMessage(messageObj, isExternalMessage) {
    // another session holds the lock and is responsible for replying
    if (!socketClient.hasSessionLock(SELF_BOT_SESSION_LOCK)) {
      return;
    }

    if (!isExternalMessage) {
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
