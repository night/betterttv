import {PlatformTypes} from '../constants.js';
import {loadModuleForPlatforms} from './modules.js';

export default loadModuleForPlatforms(
  [
    PlatformTypes.TWITCH,
    () => {
      let twitch;
      return async (message) => {
        if (twitch == null) {
          const module = await import('./twitch.js');
          twitch = module.default;
        }
        twitch.sendChatAdminMessage(message, true);
      };
    },
  ],
  [
    PlatformTypes.YOUTUBE,
    () => {
      let sendEphemeralMessage;
      return async (message) => {
        if (sendEphemeralMessage == null) {
          const module = await import('./youtube-ephemeral-messages.js');
          sendEphemeralMessage = module.sendEphemeralMessage;
        }
        return sendEphemeralMessage(message);
      };
    },
  ]
);
