export default class AbstractEmotes {
  constructor() {
    this.emotes = new Map();

    if (this.category === undefined) {
      throw new TypeError('Must set "category" attribute');
    }
  }

  getEmotes() {
    return [...this.emotes.values()];
  }

  getEligibleEmote(code) {
    return this.emotes.get(code);
  }
}
