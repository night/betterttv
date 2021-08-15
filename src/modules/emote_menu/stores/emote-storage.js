import storage from '../../../storage.js';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const MAX_TIMESTAMPS = 100;

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

    for (const [id, emote] of Object.entries(this.emoteStore.usageHistory)) {
      this.emoteStore.usageHistory[id].score = calcScore(emote);
    }

    this.frecentIds = sortHistory(this.emoteStore.usageHistory);
  }

  trackHistory(emote) {
    let {id} = emote;
    id = String(id);

    // eslint-disable-next-line no-prototype-builtins
    const emoteHistory = this.emoteStore.usageHistory[id];

    if (emoteHistory != null) {
      emoteHistory.totalUses++;
      emoteHistory.recentUses.push(Date.now());

      if (emoteHistory.recentUses.length >= MAX_TIMESTAMPS) {
        emoteHistory.recentUses.shift();
      }

      emoteHistory.score = calcScore(emoteHistory);
      this.emoteStore.usageHistory[id] = emoteHistory;
    } else {
      this.emoteStore.usageHistory[id] = {
        recentUses: [Date.now()],
        totalUses: 1,
        score: calcScore(1, [Date.now()]),
      };
    }

    this.frecentIds = sortHistory(this.emoteStore.usageHistory);
    storage.set('emotes', this.emoteStore);
  }

  setFavorite(emote, bool) {
    let {id} = emote;
    id = String(id);

    if (bool) {
      this.emoteStore.favorites.push(id);
    } else {
      this.emoteStore.favorites = this.emoteStore.favorites.filter((favoriteId) => favoriteId !== id);
    }

    storage.set('emotes', this.emoteStore);
  }

  getFavorites() {
    return this.emoteStore.favorites;
  }

  getFrecents() {
    return this.frecentIds;
  }
}

export default new EmoteStorage();
