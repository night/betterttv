import $ from 'jquery';
import debounce from 'lodash.debounce';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domWatcher from '../../observers/dom.js';
import twitch from '../../utils/twitch.js';
import {AutoPlayFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

const VIDEO_PLAYER_SELECTOR = '.video-player__container';
const CANCEL_VOD_RECOMMENDATION_SELECTOR =
  '.recommendations-overlay .pl-rec__cancel.pl-button, .autoplay-vod__content-container button';
const BTTV_PICTURE_IN_PICTURE_SELECTOR = '#bttv-picture-in-picture';

const getPictureInPictureTemplate = (toggled) => `
  <div id="bttv-picture-in-picture" class="bttv-picture-in-picture-wrapper bttv-tooltip-wrapper">
    <button aria-label="Picture in Picture">
      <div>
        <svg width="100%" height="100%" version="1.1" transform="scale(1.3)" viewBox="0 0 128 128" x="0px" y="0px">
          <path d="M22 30c-1.9 1.9-2 3.3-2 34s.1 32.1 2 34c1.9 1.9 3.3 2 42 2s40.1-.1 42-2c1.9-1.9 2-3.3 2-34 0-31.6 0-31.9-2.2-34-2.1-1.9-3.3-2-42-2-38.5 0-39.9.1-41.8 2zm78 34v28H28V36h72v28z"/>
          ${!toggled && '<path d="M60 72v12h32V60H60v12z"/>'}
        </svg>
      </div>
    </button>
    <div class="bttv-tooltip bttv-tooltip--align-center bttv-tooltip--up" role="tooltip">Picture in Picture</div>
  </div>
`;

let removeRecommendationWatcher;
function watchPlayerRecommendationVodsAutoplay() {
  if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.VOD_RECOMMENDATION_AUTOPLAY)) {
    if (removeRecommendationWatcher) removeRecommendationWatcher();
    return;
  }

  removeRecommendationWatcher = domWatcher.on(CANCEL_VOD_RECOMMENDATION_SELECTOR, (node, isConnected) => {
    if (!isConnected) return;
    $(node).trigger('click');
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

function handlePlayerScroll(event) {
  if (!settings.get(SettingIds.SCROLL_VOLUME_CONTROL)) return;

  const delta = event.originalEvent.deltaY > 0 ? -0.025 : 0.025;

  const currentPlayer = twitch.getCurrentPlayer();
  if (!currentPlayer) return;

  currentPlayer.setVolume(Math.min(Math.max(currentPlayer.getVolume() + delta, 0), 1));

  event.preventDefault();
  event.stopPropagation();
}

function togglePlayerCursor(hide) {
  $('body').toggleClass('bttv-hide-player-cursor', hide);
}

let previousVolume = null;
document.addEventListener('visibilitychange', () => {
  if (!settings.get(SettingIds.MUTE_INVISIBLE_PLAYER)) return;
  // set raw video element volume to not edit persisted player volume state
  const video = $(VIDEO_PLAYER_SELECTOR).find('video')[0];
  if (!video) return;
  if (document.visibilityState === 'visible') {
    if (previousVolume !== null) {
      video.volume = previousVolume;
      previousVolume = null;
    }
  } else if (!document.pictureInPictureElement) {
    previousVolume = video.volume;
    video.volume = 0;
  }
});

document.addEventListener('fullscreenchange', () => {
  if (document.pictureInPictureElement && document.fullscreenElement) {
    document.exitPictureInPicture();
  }
});

function togglePictureInPicture() {
  const video = $(VIDEO_PLAYER_SELECTOR).find('video')[0];
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
      this.loadVolumeScrollControl();
      this.loadPictureInPicture();
    });
    settings.on(`changed.${SettingIds.PLAYER_EXTENSIONS}`, () => this.toggleHidePlayerExtensions());
    settings.on(`changed.${SettingIds.VOD_RECOMMENDATION_AUTOPLAY}`, () => watchPlayerRecommendationVodsAutoplay());
    settings.on(`changed.${SettingIds.CLICK_TO_PLAY}`, () => this.clickToPause());
    this.toggleHidePlayerExtensions();
    this.loadHidePlayerCursorFullscreen();
  }

  loadVolumeScrollControl() {
    $(VIDEO_PLAYER_SELECTOR)
      .find('div[data-a-target="player-overlay-click-handler"]')
      .off('wheel', handlePlayerScroll)
      .on('wheel', handlePlayerScroll);
  }

  toggleHidePlayerExtensions() {
    $('body').toggleClass('bttv-hide-player-extensions', !settings.get(SettingIds.PLAYER_EXTENSIONS));
  }

  clickToPause() {
    $(VIDEO_PLAYER_SELECTOR).off(
      'click',
      '.video-player__overlay div[data-a-target="player-overlay-click-handler"]',
      handlePlayerClick
    );

    if (settings.get(SettingIds.CLICK_TO_PLAY) === true) {
      $(VIDEO_PLAYER_SELECTOR).on(
        'click',
        '.video-player__overlay div[data-a-target="player-overlay-click-handler"]',
        handlePlayerClick
      );
    }
  }

  loadHidePlayerCursorFullscreen() {
    const hidePlayerCursor = debounce(() => togglePlayerCursor(true), 5000);
    $('body').on('mousemove', 'div[data-test-selector="video-player__video-layout"]', () => {
      togglePlayerCursor(false);
      hidePlayerCursor();
    });
  }

  loadPictureInPicture() {
    if (!document.pictureInPictureEnabled || $(BTTV_PICTURE_IN_PICTURE_SELECTOR).length > 0) return;

    const video = $(VIDEO_PLAYER_SELECTOR).find('video');
    if (video.length === 0) return;

    video.on('enterpictureinpicture', () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      $(BTTV_PICTURE_IN_PICTURE_SELECTOR).replaceWith(getPictureInPictureTemplate(true));
    });

    video.on('leavepictureinpicture', () => {
      $(BTTV_PICTURE_IN_PICTURE_SELECTOR).replaceWith(getPictureInPictureTemplate(false));
    });

    const $anchor = $('.player-controls__right-control-group');
    const $settingsButton = $anchor.children('div').children('div.settings-menu-button-component').parent();
    const $button = $(getPictureInPictureTemplate(false));

    $anchor.on('click', BTTV_PICTURE_IN_PICTURE_SELECTOR, togglePictureInPicture);
    $button.insertAfter($settingsButton);
  }
}

export default new VideoPlayerModule();
