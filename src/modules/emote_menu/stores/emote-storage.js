import storage from '../../../storage.js';

const HOUR = 60 * 60 * 60 * 1000;
const DAY = 24 * HOUR;

const MAX_TIMESTAMPS = 100;

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

function calcScore(totalUses, recentUses) {
  const frecency = recentUses.reduce((a, b) => a + timestampToScore(b), 0);
  return Math.floor((totalUses * frecency) / recentUses.length);
}

class EmoteStorage {
  constructor() {
    this.emoteStore = storage.get('emotes');
    this.ids = [];

    if (this.emoteStore == null) {
      this.emoteStore = {
        usageHistory: {},
        favorites: [],
      };
    }

    this.updateAllScores();
    this.updateIds();
  }

  updateAllScores() {
    for (const [id, {totalUses, recentUses}] of Object.entries(this.emoteStore.usageHistory)) {
      this.emoteStore.usageHistory[id].score = calcScore(totalUses, recentUses);
    }
  }

  toggleFavorite(emote) {
    let {id} = emote;
    id = String(id);

    this.emoteStore.favorites = this.emoteStore.favorites.includes(id)
      ? this.emoteStore.favorites.filter((favoriteId) => favoriteId !== id)
      : [...this.emoteStore.favorites, id];

    storage.set('emotes', this.emoteStore);
  }

  getFavorites() {
    return this.emoteStore.favorites;
  }

  isFavorite(id) {
    return this.emoteStore.favorites.includes(id);
  }

  incrementEmote(emote) {
    let {id} = emote;
    id = String(id);

    // eslint-disable-next-line no-prototype-builtins
    if (this.emoteStore.usageHistory.hasOwnProperty(id)) {
      const {totalUses, recentUses} = this.emoteStore.usageHistory[id];

      const newTotalUses = totalUses + 1;
      const newRecentUses = [Date.now(), ...recentUses];

      if (newRecentUses.length >= MAX_TIMESTAMPS) {
        newRecentUses.pop();
      }

      this.emoteStore.usageHistory[id] = {
        totalUses: totalUses + 1,
        recentUses: newRecentUses,
        score: calcScore(newTotalUses, newRecentUses),
      };
    } else {
      this.emoteStore.usageHistory[id] = {
        recentUses: [Date.now()],
        totalUses: 1,
        score: calcScore(1, [Date.now()]),
      };
    }

    this.updateIds();

    storage.set('emotes', this.emoteStore);
  }

  updateIds() {
    this.ids = Object.entries(this.emoteStore.usageHistory)
      .sort(([, {score: a}], [, {score: b}]) => b - a)
      .map(([id]) => id);
  }

  getRecents() {
    return this.ids;
  }
}

export default new EmoteStorage();
