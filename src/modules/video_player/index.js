import {off, on} from 'delegated-events';
import debounce from 'lodash.debounce';
import {AutoPlayFlags, PlatformTypes, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import {bindTooltip} from '@/modules/tooltip/index';
import domWatcher from '@/observers/dom';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const VIDEO_PLAYER_SELECTOR = '.video-player__container';
const CANCEL_VOD_RECOMMENDATION_SELECTOR =
  '.recommendations-overlay .pl-rec__cancel.pl-button, .autoplay-vod__content-container button';
const BTTV_PICTURE_IN_PICTURE_SELECTOR = '#bttv-picture-in-picture';

function createPictureInPictureButton(toggled) {
  const label = toggled
    ? formatMessage({defaultMessage: 'Exit Picture in Picture'})
    : formatMessage({defaultMessage: 'Picture in Picture'});

  const container = document.createElement('div');
  container.setAttribute('id', 'bttv-picture-in-picture');
  container.classList.add('bttv-picture-in-picture-wrapper');

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', toggled);
  container.appendChild(button);

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '100%');
  icon.setAttribute('height', '100%');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  button.appendChild(icon);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm2 0v14h16V5H4Zm8 6h6v6h-6v-6Z'
  );
  icon.appendChild(path);

  bindTooltip(container, {content: label, alignment: 'end', className: 'bttv-player-tooltip'});

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
  } else if (!document.pictureInPictureElement && !video.muted) {
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

async function resetPlayer(event) {
  const button = event.currentTarget;
  if (button.disabled) return;

  button.disabled = true;
  try {
    const source = twitch.getCurrentPlayerSource();
    const player = twitch.getCurrentPlayer();
    if (!source || !player) throw new Error('Player unavailable');
    const duration = player.getDuration();
    const position = Number.isFinite(duration) && duration > 0 ? player.getPosition() : null;
    await source.setSrc({isNewMediaPlayerInstance: false});
    if (Number.isFinite(position) && position >= 0) {
      // Twitch needs time to load the source before restoring a VOD's position.
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (twitch.getCurrentPlayer() === player) player.seekTo(position);
    }
  } catch (_) {
    twitch.sendChatAdminMessage(
      formatMessage({defaultMessage: 'Unable to reset the player. Try refreshing the page.'})
    );
  } finally {
    button.disabled = false;
  }
}

class VideoPlayerModule {
  constructor() {
    watcher.on('load.player', () => {
      this.clickToPause();
      watchPlayerRecommendationVodsAutoplay();
      this.loadScrollControl();
      this.loadPictureInPicture();
      this.loadResetButton();
    });
    settings.on(`changed.${SettingIds.PLAYER_EXTENSIONS}`, () => this.toggleHidePlayerExtensions());
    settings.on(`changed.${SettingIds.PIP_BUTTON}`, () => this.togglePlayerButtons());
    settings.on(`changed.${SettingIds.RESET_BUTTON}`, () => this.togglePlayerButtons());
    settings.on(`changed.${SettingIds.VOD_RECOMMENDATION_AUTOPLAY}`, () => watchPlayerRecommendationVodsAutoplay());
    settings.on(`changed.${SettingIds.CLICK_TO_PLAY}`, () => this.clickToPause());
    this.toggleHidePlayerExtensions();
    this.togglePlayerButtons();
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

  loadResetButton() {
    const controls = document.querySelector('.player-controls__right-control-group');
    const anchor = controls?.querySelector(':scope > div:has(button[data-a-target="player-settings-button"])');
    if (!anchor || controls.querySelector('#bttv-reset-player')) return;

    const label = formatMessage({defaultMessage: 'Reset Player'});
    const container = document.createElement('div');
    container.id = 'bttv-reset-player';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.addEventListener('click', resetPlayer);
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('width', '100%');
    icon.setAttribute('height', '100%');
    icon.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20 12a8 8 0 1 1-2.343-5.657L20 9M20 4v5h-5');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    icon.appendChild(path);
    button.appendChild(icon);
    container.appendChild(button);
    bindTooltip(container, {content: label, alignment: 'end', className: 'bttv-player-tooltip'});
    anchor.after(container);
  }

  toggleHidePlayerExtensions() {
    document.body.classList.toggle('bttv-hide-player-extensions', !settings.get(SettingIds.PLAYER_EXTENSIONS));
  }

  togglePlayerButtons() {
    document.body.classList.toggle('bttv-hide-pip-button', !settings.get(SettingIds.PIP_BUTTON));
    document.body.classList.toggle('bttv-hide-reset-button', !settings.get(SettingIds.RESET_BUTTON));
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

    const anchor =
      document.querySelector('#bttv-reset-player') ||
      document.querySelector(
        '.player-controls__right-control-group > div:has(button[data-a-target="player-settings-button"])'
      );
    if (anchor == null) {
      return;
    }

    const button = createPictureInPictureButton(false);
    button.addEventListener('click', togglePictureInPicture);
    anchor.after(button);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new VideoPlayerModule()]);
