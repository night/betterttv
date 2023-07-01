import {DEFAULT_FREQUENT_EMOTES, EmoteProviders, PlatformTypes} from '../../../constants.js';
import storage from '../../../storage.js';
import {getPlatform} from '../../../utils/window.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const MAX_TIMESTAMPS = 100;
const MAX_FRECENTS = 250;

function timestampToScore(timestamp) {
  const diff = Date.now() - timestamp;

  switch (true) {
    case diff < 4 * HOUR:
      return 100;
    case diff < DAY:
      return 80;
    case diff < 3 * DAY:
      return 60;
    case diff < 7 * DAY:
      return 40;
    case diff < 30 * DAY:
      return 20;
    case diff < 90 * DAY:
      return 10;
    default:
      return 0;
  }
}

function computeScore({totalUses, recentUses}) {
  const frecency = recentUses.reduce((a, b) => a + timestampToScore(b), 0);
  return Math.floor((totalUses * frecency) / recentUses.length);
}

const TWITCH_EMOTE_USAGE_HISTORY_KEY = 'twilight.emote_picker_history';

function loadDefaultFrequentEmotes() {
  if (getPlatform() !== PlatformTypes.TWITCH || !storage.localStorageSupport) {
    return DEFAULT_FREQUENT_EMOTES;
  }

  const history = storage.get(TWITCH_EMOTE_USAGE_HISTORY_KEY, null);
  if (history == null) {
    return DEFAULT_FREQUENT_EMOTES;
  }

  try {
    const historyEntries = Object.entries(history);
    if (historyEntries.length === 0) {
      return DEFAULT_FREQUENT_EMOTES;
    }
    const emoteHistory = {};
    for (const [emoteId, {uses, lastUpdatedAt}] of historyEntries) {
      const serializedEmoteId = `${EmoteProviders.TWITCH}-${emoteId}`;
      emoteHistory[serializedEmoteId] = {
        recentUses: [lastUpdatedAt],
        totalUses: uses,
        score: computeScore({totalUses: uses, recentUses: [lastUpdatedAt]}),
      };
    }
    return emoteHistory;
  } catch (_) {
    return DEFAULT_FREQUENT_EMOTES;
  }
}

class EmoteMenuStore {
  constructor() {
    this.emoteMenuStore = storage.get('emotes');

    if (this.emoteMenuStore == null) {
      this.emoteMenuStore = {
        usageHistory: loadDefaultFrequentEmotes(),
        favorites: [],
      };
    }

    this.frecents = [];
    this.favorites = this.emoteMenuStore.favorites;

    this.updateFrecents(true);
  }

  trackHistory(emote) {
    const emoteCanonicalId = emote.canonicalId;
    let emoteHistory = this.emoteMenuStore.usageHistory[emoteCanonicalId];

    if (emoteHistory == null) {
      emoteHistory = {
        recentUses: [],
        totalUses: 0,
        score: 0,
      };
    }

    emoteHistory.totalUses++;
    emoteHistory.recentUses.push(Date.now());
    if (emoteHistory.recentUses.length > MAX_TIMESTAMPS) {
      emoteHistory.recentUses.shift();
    }
    emoteHistory.score = computeScore(emoteHistory);

    this.emoteMenuStore.usageHistory[emoteCanonicalId] = emoteHistory;

    this.updateFrecents();
  }

  updateFrecents(updateScores = false) {
    if (updateScores) {
      for (const emoteHistory of Object.values(this.emoteMenuStore.usageHistory)) {
        emoteHistory.score = computeScore(emoteHistory);
      }
    }

    const sortedTrimmedUsageHistory = Object.entries(this.emoteMenuStore.usageHistory)
      .sort(([, {score: a}], [, {score: b}]) => b - a)
      .slice(0, MAX_FRECENTS);

    this.frecents = sortedTrimmedUsageHistory.map(([emoteCanonicalId]) => emoteCanonicalId);
    this.emoteMenuStore.usageHistory = Object.fromEntries(sortedTrimmedUsageHistory);

    this.save();
  }

  setFavorite(emoteCanonicalId, enabled) {
    const favoriteIndex = this.favorites.indexOf(emoteCanonicalId);
    if (enabled && favoriteIndex === -1) {
      this.favorites.push(emoteCanonicalId);
    } else if (!enabled && favoriteIndex > -1) {
      this.favorites.splice(favoriteIndex, 1);
    }

    this.save();
  }

  save() {
    storage.set('emotes', {
      usageHistory: this.emoteMenuStore.usageHistory,
      favorites: this.favorites,
    });
  }
}

export default new EmoteMenuStore();
