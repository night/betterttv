import {PlatformTypes} from '../constants.js';
import {loadModuleForPlatforms} from './modules.js';

// moved because of cyclic dep in window.js

export function isExternalTwitchWindow() {
  return window.location.pathname.endsWith('/chat');
}

export function isExternalYoutubeWindow() {
  return window.location.pathname.endsWith('/live_chat');
}

export const isExternalWindow = loadModuleForPlatforms(
  [PlatformTypes.YOUTUBE, () => isExternalYoutubeWindow],
  [PlatformTypes.TWITCH, () => isExternalTwitchWindow]
);
