import storage from '../storage.js';

class Tips {
  constructor() {
    this.tips = storage.get('tips');

    if (this.tips == null) {
      this.tips = {};
    }
  }

  getTip(id) {
    if (id == null) {
      return null;
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!this.tips.hasOwnProperty(id)) {
      this.tips[id] = {
        id,
        timesSeen: 0,
        learnt: false,
      };

      storage.set('tips', this.tips);
    }

    return this.tips[id];
  }

  seenTip(id) {
    const tip = this.getTip(id);
    tip.timesSeen += 1;
    this.tips[id] = tip;

    storage.set('tips', this.tips);
  }

  learnTip(id) {
    const tip = this.getTip(id);
    tip.learnt = true;
    this.tips[id] = tip;

    storage.set('tips', this.tips);
  }
}

export default new Tips();
