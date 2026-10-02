export const TIMER_MIN_INTERVAL_MINUTES = 1;
export const TIMER_MAX_INTERVAL_MINUTES = 24 * 60;
export const TIMER_MIN_CHAT_LINES = 2;
export const TIMER_MAX_CHAT_LINES = 100;
export const TIMER_MAX_MESSAGE_LENGTH = 500;
export const DEFAULT_TIMER_INTERVAL_MINUTES = 5;

export function computeSelfBotTimers(timersMap) {
  const computed = [];

  if (timersMap == null) {
    return computed;
  }

  for (const {id, message, intervalMinutes, lines, enabled} of Object.values(timersMap)) {
    if (enabled === false) {
      continue;
    }

    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    if (id == null || trimmedMessage.length === 0 || trimmedMessage.length > TIMER_MAX_MESSAGE_LENGTH) {
      continue;
    }

    // never let a timer run chat commands unattended (/clear, /raid, ...)
    if (trimmedMessage.startsWith('/') || trimmedMessage.startsWith('.')) {
      continue;
    }

    // stored settings are untrusted (cloud backup restores arbitrary JSON); an
    // invalid interval skips the timer rather than firing at a clamped rate
    if (
      !Number.isInteger(intervalMinutes) ||
      intervalMinutes < TIMER_MIN_INTERVAL_MINUTES ||
      intervalMinutes > TIMER_MAX_INTERVAL_MINUTES
    ) {
      continue;
    }

    if (!Number.isInteger(lines) || lines < TIMER_MIN_CHAT_LINES || lines > TIMER_MAX_CHAT_LINES) {
      continue;
    }

    computed.push({
      id,
      message: trimmedMessage,
      intervalMinutes,
      lines,
    });
  }

  return computed;
}
