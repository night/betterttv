import api from '../utils/api.js';
import debug from '../utils/debug.js';
import {getCurrentChannel} from '../utils/channel.js';

let channel;
let watcher;
function updateChannel() {
  const currentChannel = getCurrentChannel();
  if (!currentChannel || (channel && currentChannel.id === channel.id)) return;

  debug.log(`Channel Observer: ${currentChannel.name} (${currentChannel.id}) loaded.`);

  channel = currentChannel;

  api
    .get(`cached/users/${channel.provider}/${channel.id}`)
    .catch((error) => ({
      bots: [],
      channelEmotes: [],
      sharedEmotes: [],
      status: error.status || 0,
    }))
    .then((data) => watcher.emit('channel.updated', data));
}

export default function channelWatcher(watcher_) {
  watcher = watcher_;

  watcher.on('load.channel', updateChannel);
  watcher.on('load.chat', updateChannel);
  watcher.on('load.vod', updateChannel);
}
