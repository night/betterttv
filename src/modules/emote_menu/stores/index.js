import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import channelEmotes from '../../emotes/channel-emotes.js';
import globalEmotes from '../../emotes/global-emotes.js';
import ffzChannelEmotes from '../../frankerfacez/channel-emotes.js';
import ffzGlobalEmotes from '../../frankerfacez/global-emotes.js';
import Icons from '../components/Icons.jsx';

const COLOUMN_COUNT = 7;

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();
    watcher.on('channel.updated', () => {
      this.loadProviders();
      this.loadEmotes();
    });
  }

  get totalRows() {
    return this.rows.length;
  }

  loadProviders() {
    this.providers = [
      {
        provider: {
          id: 'bttv',
          displayName: 'BetterTTV',
          icon: Icons.THUMBS_UP,
        },
        emotes: [...channelEmotes.getEmotes(), ...globalEmotes.getEmotes()],
      },
      {
        provider: {
          id: 'ffz',
          displayName: 'FrankerFaceZ',
          icon: Icons.DOG,
        },
        emotes: [...ffzChannelEmotes.getEmotes(), ...ffzGlobalEmotes.getEmotes()],
      },
      ...emojiCategories,
    ];
  }

  loadEmotes() {
    this.headers = {};
    this.rows = [];

    for (const provider of this.providers) {
      if (provider.emotes.length === 0) {
        continue;
      }

      this.headers[this.totalRows] = provider.provider;
      this.rows = [...this.rows, provider.provider, ...chunkArray(provider.emotes, COLOUMN_COUNT)];
    }

    this.emit('loaded');
  }

  getRow(index) {
    return this.rows[index];
  }

  getHeaders() {
    return Object.values(this.headers);
  }

  isHeader(index) {
    return index in this.headers;
  }
}

export default new EmoteStore();
