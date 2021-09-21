import storage from '../../../storage.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const MAX_TIMESTAMPS = 100;
const MAX_FRECENTS = 250;

function sortHistory(history, limit) {
  return Object.fromEntries(
    Object.entries(history)
      .sort(([, {score: a}], [, {score: b}]) => b - a)
      .slice(0, limit)
  );
}

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

function calcScore({totalUses, recentUses}) {
  const frecency = recentUses.reduce((a, b) => a + timestampToScore(b), 0);
  return Math.floor((totalUses * frecency) / recentUses.length);
}

class EmoteStorage {
  constructor() {
    this.emoteStore = storage.get('emotes');

    if (this.emoteStore == null) {
      this.emoteStore = {
        usageHistory: {},
        favorites: [],
      };
    }

    for (const [id, emote] of Object.entries(this.emoteStore.usageHistory)) {
      this.emoteStore.usageHistory[id].score = calcScore(emote);
    }

    this.frecents = new Set();
    this.favorites = new Set(this.emoteStore.favorites);
    this.updateFrecents();
  }

  trackHistory(emote) {
    const emoteCanonicalId = emote.canonicalId;
    let emoteHistory = this.emoteStore.usageHistory[emoteCanonicalId];

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
    emoteHistory.score = calcScore(emoteHistory);

    this.emoteStore.usageHistory[emoteCanonicalId] = emoteHistory;

    this.updateFrecents();
    this.save();
  }

  updateFrecents() {
    this.emoteStore.usageHistory = sortHistory(this.emoteStore.usageHistory, MAX_FRECENTS);
    this.frecents = new Set(Object.keys(this.emoteStore.usageHistory));

    this.save();
  }

  setFavorite(emoteCanonicalId, bool) {
    if (bool) {
      this.favorites.add(emoteCanonicalId);
    } else {
      this.favorites.delete(emoteCanonicalId);
    }

    this.save();
  }

  save() {
    storage.set('emotes', {
      usageHistory: this.emoteStore.usageHistory,
      favorites: Array.from(this.favorites),
    });
  }
}

export default new EmoteStorage();
