export const TIMER_MIN_INTERVAL_MINUTES = 1;
export const TIMER_MAX_INTERVAL_MINUTES = 24 * 60;
export const TIMER_MIN_CHAT_LINES = 2;
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

    if (id == null || typeof message !== 'string' || message.trim().length === 0) {
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

    if (!Number.isInteger(lines) || lines < TIMER_MIN_CHAT_LINES) {
      continue;
    }

    computed.push({
      id,
      message: message.trim(),
      intervalMinutes,
      lines,
    });
  }

  return computed;
}
