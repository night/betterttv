import {PlatformTypes} from '@/constants';
import {loadModuleForPlatforms} from './modules';

export default loadModuleForPlatforms(
  [
    PlatformTypes.TWITCH,
    () => {
      let twitch;
      return async (message) => {
        if (twitch == null) {
          const module = await import('./twitch');
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
          const module = await import('./youtube-ephemeral-messages');
          sendEphemeralMessage = module.sendEphemeralMessage;
        }
        return sendEphemeralMessage(message);
      };
    },
  ]
);
