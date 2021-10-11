import {PlatformTypes} from '../constants.js';

export function getPlatform() {
  const {hostname} = window.location;

  if (hostname.endsWith('.youtube.com')) {
    return PlatformTypes.YOUTUBE;
  }

  if (hostname === 'clips.twitch.tv') {
    return PlatformTypes.TWITCH_CLIPS;
  }

  if (hostname.endsWith('.twitch.tv')) {
    return PlatformTypes.TWITCH;
  }

  throw new Error('unsupported platform');
}

export function isFrame() {
  try {
    return window.self !== window.top;
  } catch (_) {
    return true;
  }
}

export function isPopout() {
  try {
    return window.opener && window.opener !== window;
  } catch (_) {
    return true;
  }
}
