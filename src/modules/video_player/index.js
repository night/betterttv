import debounce from 'lodash.debounce';
import {off, on} from 'delegated-events';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domWatcher from '../../observers/dom.js';
import twitch from '../../utils/twitch.js';
import {AutoPlayFlags, PlatformTypes, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import formatMessage from '../../i18n/index.js';

const VIDEO_PLAYER_SELECTOR = '.video-player__container';
const CANCEL_VOD_RECOMMENDATION_SELECTOR =
  '.recommendations-overlay .pl-rec__cancel.pl-button, .autoplay-vod__content-container button';
const BTTV_PICTURE_IN_PICTURE_SELECTOR = '#bttv-picture-in-picture';

function createPictureInPictureButton(toggled) {
  const label = formatMessage({defaultMessage: 'Picture in Picture'});

  const container = document.createElement('div');
  container.setAttribute('id', 'bttv-picture-in-picture');
  container.classList.add('bttv-picture-in-picture-wrapper', 'bttv-tooltip-wrapper');

  const button = document.createElement('button');
  button.setAttribute('aria-label', label);
  container.appendChild(button);

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '100%');
  icon.setAttribute('height', '100%');
  icon.setAttribute('transform', 'scale(1.3)');
  icon.setAttribute('viewBox', '0 0 128 128');
  icon.setAttribute('x', '0px');
  icon.setAttribute('y', '0px');
  button.appendChild(icon);

  const iconPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath1.setAttribute(
    'd',
    'M22 30c-1.9 1.9-2 3.3-2 34s.1 32.1 2 34c1.9 1.9 3.3 2 42 2s40.1-.1 42-2c1.9-1.9 2-3.3 2-34 0-31.6 0-31.9-2.2-34-2.1-1.9-3.3-2-42-2-38.5 0-39.9.1-41.8 2zm78 34v28H28V36h72v28z'
  );
  icon.appendChild(iconPath1);

  if (toggled) {
    const iconPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    iconPath2.setAttribute('d', 'M60 72v12h32V60H60v12z');
    icon.appendChild(iconPath2);
  }

  const tooltip = document.createElement('div');
  tooltip.classList.add('bttv-tooltip', 'bttv-tooltip--align-center', 'bttv-tooltip--up');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.innerText = label;
  container.appendChild(tooltip);

  return container;
}

let removeRecommendationWatcher;

function watchPlayerRecommendationVodsAutoplay() {
  if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY)) {
    if (removeRecommendationWatcher) removeRecommendationWatcher();
    return;
  }

  removeRecommendationWatcher = domWatcher.on(CANCEL_VOD_RECOMMENDATION_SELECTOR, (node, isConnected) => {
    if (!isConnected) return;
    node.click();
  });
}

let clicks = 0;

function handlePlayerClick() {
  const currentPlayer = twitch.getCurrentPlayer();
  if (!currentPlayer) return;
  const {paused} = currentPlayer;
  clicks++;
  setTimeout(() => {
    if (clicks === 1) {
      if (!paused) {
        currentPlayer.pause();
      }
    }
    clicks = 0;
  }, 250);
}

function maybeSeek(event) {
  // Default seek time is 2 seconds for VODs
  const delta = event.deltaY > 0 ? -2 : 2;

  const currentPlayer = twitch.getCurrentPlayer();
  if (!currentPlayer || currentPlayer.getDuration() === Infinity) return;

  currentPlayer.seekTo(currentPlayer.getPosition() + delta);

  event.preventDefault();
  event.stopPropagation();
}

function maybeControlVolume(event) {
  const delta = event.deltaY > 0 ? -0.025 : 0.025;

  const currentPlayer = twitch.getCurrentPlayer();
  if (!currentPlayer) return;

  currentPlayer.setVolume(Math.min(Math.max(currentPlayer.getVolume() + delta, 0), 1));

  event.preventDefault();
  event.stopPropagation();
}

function handlePlayerScroll(event) {
  if (!settings.get(SettingIds.SCROLL_PLAYER_CONTROLS)) return;

  // Alt scrolling controls video seeking
  if (event.altKey) {
    maybeSeek(event);
  } else {
    maybeControlVolume(event);
  }
}

function togglePlayerCursor(hide) {
  document.body.classList.toggle('bttv-hide-player-cursor', hide);
}

let isMuted = false;
document.addEventListener('visibilitychange', () => {
  if (!settings.get(SettingIds.MUTE_INVISIBLE_PLAYER)) return;
  // set raw video element volume to not edit persisted player volume state
  const video = document.querySelector(VIDEO_PLAYER_SELECTOR)?.querySelector('video');
  if (!video) return;
  if (document.visibilityState === 'visible') {
    if (isMuted) {
      video.muted = false;
      isMuted = false;
    }
  } else if (!document.pictureInPictureElement) {
    video.muted = true;
    isMuted = true;
  }
});

document.addEventListener('fullscreenchange', () => {
  if (document.pictureInPictureElement && document.fullscreenElement) {
    document.exitPictureInPicture();
  }
});

function togglePictureInPicture() {
  const video = document.querySelector(VIDEO_PLAYER_SELECTOR)?.querySelector('video');
  if (!video) return;

  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else {
    video.requestPictureInPicture();
  }
}

class VideoPlayerModule {
  constructor() {
    watcher.on('load.player', () => {
      this.clickToPause();
      watchPlayerRecommendationVodsAutoplay();
      this.loadScrollControl();
      this.loadPictureInPicture();
    });
    settings.on(`changed.${SettingIds.PLAYER_EXTENSIONS}`, () => this.toggleHidePlayerExtensions());
    settings.on(`changed.${SettingIds.VOD_RECOMMENDATION_AUTOPLAY}`, () => watchPlayerRecommendationVodsAutoplay());
    settings.on(`changed.${SettingIds.CLICK_TO_PLAY}`, () => this.clickToPause());
    this.toggleHidePlayerExtensions();
    this.loadHidePlayerCursorFullscreen();
  }

  loadScrollControl() {
    const videoPlayerOverlay = document
      .querySelector(VIDEO_PLAYER_SELECTOR)
      ?.querySelector('div[data-a-target="player-overlay-click-handler"]');
    if (videoPlayerOverlay == null) return;
    videoPlayerOverlay.removeEventListener('wheel', handlePlayerScroll);
    videoPlayerOverlay.addEventListener('wheel', handlePlayerScroll);
  }

  toggleHidePlayerExtensions() {
    document.body.classList.toggle('bttv-hide-player-extensions', !settings.get(SettingIds.PLAYER_EXTENSIONS));
  }

  clickToPause() {
    off('click', '.video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);

    if (settings.get(SettingIds.CLICK_TO_PLAY) === true) {
      on('click', '.video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);
    }
  }

  loadHidePlayerCursorFullscreen() {
    const hidePlayerCursor = debounce(() => togglePlayerCursor(true), 5000);
    on('mousemove', 'div[data-test-selector="video-player__video-layout"]', () => {
      togglePlayerCursor(false);
      hidePlayerCursor();
    });
  }

  loadPictureInPicture() {
    if (!document.pictureInPictureEnabled || document.querySelector(BTTV_PICTURE_IN_PICTURE_SELECTOR) != null) return;

    const video = document.querySelector(VIDEO_PLAYER_SELECTOR)?.querySelector('video');
    if (video == null) return;

    video.addEventListener('enterpictureinpicture', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      const button = createPictureInPictureButton(true);
      document.querySelector(BTTV_PICTURE_IN_PICTURE_SELECTOR)?.replaceWith(button);
      button.addEventListener('click', togglePictureInPicture);
    });

    video.addEventListener('leavepictureinpicture', () => {
      const button = createPictureInPictureButton(false);
      document.querySelector(BTTV_PICTURE_IN_PICTURE_SELECTOR)?.replaceWith(button);
      button.addEventListener('click', togglePictureInPicture);
    });

    const anchor = document.querySelector('.player-controls__right-control-group .resize-detector');
    if (anchor == null) {
      return;
    }

    const button = createPictureInPictureButton(false);
    button.addEventListener('click', togglePictureInPicture);
    anchor.after(button);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new VideoPlayerModule()]);
