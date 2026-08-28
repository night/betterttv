export const TIMER_MIN_INTERVAL_MINUTES = 1;

export function computeSelfBotTimers(timersMap) {
  const computed = [];

  if (timersMap == null) {
    return computed;
  }

  for (const {id, message, intervalMinutes, lines} of Object.values(timersMap)) {
    if (id == null || message == null || message.trim().length === 0) {
      continue;
    }

    // stored settings are untrusted (cloud backup restores arbitrary JSON); an
    // invalid interval skips the timer rather than firing at a clamped rate
    if (!Number.isInteger(intervalMinutes) || intervalMinutes < TIMER_MIN_INTERVAL_MINUTES) {
      continue;
    }

    computed.push({
      id,
      message: message.trim(),
      intervalMinutes,
      lines: Number.isInteger(lines) && lines > 0 ? lines : 0,
    });
  }

  return computed;
}
