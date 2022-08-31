import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import emoteSocketListeners from './emote-socket-listeners.js';

loadModuleForPlatforms(
  [
    PlatformTypes.TWITCH,
    async () => {
      const {default: twitch} = await import('../../utils/twitch.js');
      return emoteSocketListeners(twitch.sendChatAdminMessage);
    },
  ],
  [
    PlatformTypes.YOUTUBE,
    async () => {
      const {default: youtube} = await import('../../utils/youtube.js');
      return emoteSocketListeners(youtube.sendChatAdminMessage);
    },
  ]
);
