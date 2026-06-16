import debug from '@/utils/debug';
import SafeEventEmitter from '@/utils/safe-event-emitter';
import {getPlatform} from '@/utils/window';
import {PlatformTypes} from './constants';

class Watcher extends SafeEventEmitter {
  async setup() {
    (await import('@/watchers/channel')).default(this);

    const platform = getPlatform();

    if (platform === PlatformTypes.YOUTUBE) {
      (await import('@/watchers/youtube')).default(this);
    } else if (platform === PlatformTypes.TWITCH_CLIPS) {
      (await import('@/watchers/clips')).default(this);
    } else if (platform === PlatformTypes.TWITCH) {
      (await import('@/watchers/chat')).default(this);
      (await import('@/watchers/conversations')).default(this);
      (await import('@/watchers/routes')).default(this);
    }

    debug.log('Watcher started');
  }
}

export default new Watcher();
