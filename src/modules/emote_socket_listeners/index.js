import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import emoteSocketListeners from './emote-socket-listeners.js';

loadModuleForPlatforms(
  [
    PlatformTypes.TWITCH,
    async () => {
      const {default: twitch} = await import('../../utils/twitch.js');
      return emoteSocketListeners((message) => twitch.sendChatAdminMessage(message, true));
    },
  ],
  [
    PlatformTypes.YOUTUBE,
    async () => {
      const {sendEphemeralMessage} = await import('../../utils/youtube.js');
      return emoteSocketListeners(sendEphemeralMessage);
    },
  ]
);
