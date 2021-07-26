import Emotes from '../emotes/index.js';

class EmotesGrid extends Emotes {
  constructor() {
    super();
    this.cols = 6;
    console.log(this);
  }

  get totalRows() {
    return this.length;
  }
}

export default new EmotesGrid();
