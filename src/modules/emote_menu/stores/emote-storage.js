import storage from '../../../storage.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const MAX_TIMESTAMPS = 100;
const PURGE_SCORE = 40;

function sortHistory(history) {
  return Object.entries(history)
    .sort(([, {score: a}], [, {score: b}]) => b - a)
    .map(([id]) => id);
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
    this.frecentIds = [];

    if (this.emoteStore == null) {
      this.emoteStore = {
        usageHistory: {},
        favorites: [],
      };
    }

    this.favorites = new Set(this.emoteStore.favorites);

    for (const [id, emote] of Object.entries(this.emoteStore.usageHistory)) {
      const score = calcScore(emote);

      if (score <= PURGE_SCORE) {
        delete this.emoteStore.usageHistory[id];
      } else {
        this.emoteStore.usageHistory[id].score = score;
      }
    }

    this.frecentIds = sortHistory(this.emoteStore.usageHistory);
  }

  trackHistory(emote) {
    let {id} = emote;
    id = String(id);

    let emoteHistory = this.emoteStore.usageHistory[id];

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

    this.emoteStore.usageHistory[id] = emoteHistory;

    this.frecentIds = sortHistory(this.emoteStore.usageHistory);

    this.save();
  }

  setFavorite(emote, bool) {
    let {id} = emote;
    id = String(id);

    if (bool) {
      this.favorites.add(id);
    } else {
      this.favorites.delete(id);
    }

    this.save();
  }

  save() {
    storage.set('emotes', {
      usageHistory: this.emoteStore.usageHistory,
      favorites: Array.from(this.favorites),
    });
  }

  getFavorites() {
    return this.favorites;
  }

  getFrecents() {
    return this.frecentIds;
  }
}

export default new EmoteStorage();
