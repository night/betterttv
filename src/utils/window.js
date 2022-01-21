import {PlatformTypes} from '../constants.js';

let platform;
let navigatorPlatform;

export function getPlatform() {
  if (platform != null) {
    return platform;
  }

  const {hostname} = window.location;

  if (hostname.endsWith('.youtube.com')) {
    platform = PlatformTypes.YOUTUBE;
  } else if (hostname === 'clips.twitch.tv') {
    platform = PlatformTypes.TWITCH_CLIPS;
  } else if (hostname.endsWith('.twitch.tv')) {
    platform = PlatformTypes.TWITCH;
  } else {
    throw new Error('unsupported platform');
  }

  return platform;
}

export function isMac() {
  if (navigatorPlatform != null) {
    return navigatorPlatform;
  }

  navigatorPlatform = navigator.platform.toLowerCase().startsWith('mac');
  return navigatorPlatform;
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

export function isStandaloneWindow() {
  const currentPlatform = getPlatform();

  if (currentPlatform === PlatformTypes.TWITCH) {
    return window.location.pathname.endsWith('/chat');
  }

  if (currentPlatform === PlatformTypes.YOUTUBE) {
    return window.location.pathname.endsWith('/live_chat');
  }

  return false;
}
