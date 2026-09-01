export const TIMER_MIN_INTERVAL_MINUTES = 1;
export const TIMER_MAX_INTERVAL_MINUTES = 24 * 60;
export const TIMER_MIN_CHAT_LINES = 2;
export const DEFAULT_TIMER_INTERVAL_MINUTES = 5;

function clampInteger(value, min, max, fallback) {
  if (!Number.isInteger(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

export function repairSelfBotTimerEntry(id, entry) {
  const message = typeof entry.message === 'string' ? entry.message : '';
  const intervalMinutes = clampInteger(
    entry.intervalMinutes,
    TIMER_MIN_INTERVAL_MINUTES,
    TIMER_MAX_INTERVAL_MINUTES,
    DEFAULT_TIMER_INTERVAL_MINUTES
  );
  const lines = clampInteger(entry.lines, TIMER_MIN_CHAT_LINES, Infinity, TIMER_MIN_CHAT_LINES);

  if (
    entry.id === id &&
    entry.message === message &&
    entry.intervalMinutes === intervalMinutes &&
    entry.lines === lines
  ) {
    return entry;
  }

  return {...entry, id, message, intervalMinutes, lines};
}

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
