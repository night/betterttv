const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');

const VIDEO_PLAYER_SELECTOR = '.video-player .player,.highwind-video-player__container';
const CANCEL_VOD_RECOMMENDATION_SELECTOR = '.recommendations-overlay .pl-rec__cancel.pl-button, .autoplay-vod__content-container button';

function stepPlaybackSpeed(faster) {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;
    const rates = [ 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0 ];
    let idx = rates.indexOf(currentPlayer.getPlaybackRate());
    if (idx === -1) return;
    idx += faster ? 1 : -1;
    if (idx < 0 || idx >= rates.length) return;
    currentPlayer.setPlaybackRate(rates[idx]);
}

function watchPlayerRecommendationVodsAutoplay() {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;

    const handleEndedEvent = () => {
        if (settings.get('disableVodRecommendationAutoplay') !== true) return;
        watcher.waitForLoad('vodRecommendation').then(() => $(CANCEL_VOD_RECOMMENDATION_SELECTOR).trigger('click'));
    };

    if (currentPlayer.emitter) {
        currentPlayer.emitter.on('Ended', handleEndedEvent);
    } else {
        currentPlayer.addEventListener('ended', handleEndedEvent);
    }
}

function handleKeyEvent(keydown) {
    if (keydown.ctrlKey || keydown.metaKey) return;
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $(VIDEO_PLAYER_SELECTOR);
    if (!$player.length) return;

    switch (keydown.charCode || keydown.keyCode) {
        case keyCodes.Comma:
            stepPlaybackSpeed(false);
            break;
        case keyCodes.Period:
            stepPlaybackSpeed(true);
            break;
        case keyCodes.K:
            $player.find('.qa-pause-play-button').click();
            break;
        case keyCodes.F:
            $player.find('.qa-fullscreen-button').click();
            break;
        case keyCodes.M:
            $player.find('.qa-control-volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClick() {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;
    const paused = currentPlayer.paused;
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

function togglePlayerCursor(hide) {
    $('body').toggleClass('bttv-hide-player-cursor', hide);
}

function togglePiP() {
    const videoElement = $(VIDEO_PLAYER_SELECTOR)
        .find('video')
        .get(0);

    if (!videoElement) return;

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else {
        videoElement.requestPictureInPicture();
    }
}

class VideoPlayerModule {
    constructor() {
        this.keybinds();
        watcher.on('load.player', () => {
            this.clickToPause();
            watchPlayerRecommendationVodsAutoplay();
        });
        settings.add({
            id: 'hidePlayerExtensions',
            name: 'Hide Twitch Extensions',
            defaultValue: false,
            description: 'Hides the interactive overlays on top of Twitch\'s video player'
        });
        settings.add({
            id: 'clickToPlay',
            name: 'Click to Play/Pause Stream',
            defaultValue: false,
            description: 'Click on the twitch player to pause/resume playback'
        });
        settings.add({
            id: 'disableVodRecommendationAutoplay',
            name: 'Disable VoD Recommendation Autoplay',
            defaultValue: false,
            description: 'Disables autoplay of recommended videos on VoDs'
        });
        settings.on('changed.hidePlayerExtensions', () => this.toggleHidePlayerExtensions());
        settings.on('changed.clickToPlay', () => this.clickToPause());
        this.toggleHidePlayerExtensions();
        this.loadHidePlayerCursorFullscreen();
        this.setupPiP();
    }

    toggleHidePlayerExtensions() {
        $('body').toggleClass('bttv-hide-player-extensions', settings.get('hidePlayerExtensions'));
    }

    keybinds() {
        $(document).on('keydown.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $(VIDEO_PLAYER_SELECTOR).off('click', '.player-overlay.pl-overlay__fullscreen,.player-video,.tw-c-text-overlay > div,.js-paused-overlay,.highwind-video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $(VIDEO_PLAYER_SELECTOR).on('click', '.player-overlay.pl-overlay__fullscreen,.player-video,.tw-c-text-overlay > div,.js-paused-overlay,.highwind-video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);
        }
    }

    loadHidePlayerCursorFullscreen() {
        const hidePlayerCursor = debounce(() => togglePlayerCursor(true), 5000);
        $('body').on('mousemove', '.video-player--fullscreen,div[data-test-selector="highwind-video-player__video-layout"]', () => {
            togglePlayerCursor(false);
            hidePlayerCursor();
        });
    }

    setupPiP() {
        if (!document.pictureInPictureEnabled) return;

        const videoElement = $(VIDEO_PLAYER_SELECTOR).find('video');
        const pipSVG =
            '<path d="M22 30c-1.9 1.9-2 3.3-2 34s.1 32.1 2 34c1.9 1.9 3.3 2 42 2s40.1-.1 42-2c1.9-1.9 2-3.3 2-34 0-31.6 0-31.9-2.2-34-2.1-1.9-3.3-2-42-2-38.5 0-39.9.1-41.8 2zm78 34v28H28V36h72v28z"/>';
        const pipEnabledSVG = pipSVG + '<path d="M60 72v12h32V60H60v12z"/>';

        videoElement.on('enterpictureinpicture', () => {
            $('#bttv-pip')
                .find('svg')
                .html(pipSVG);
        });

        videoElement.on('leavepictureinpicture', () => {
            $('#bttv-pip')
                .find('svg')
                .html(pipEnabledSVG);
        });

        const $anchor = $('.player-controls__right-control-group');
        const $button = $anchor
            .children()
            .last()
            .clone(false, false)
            .attr('id', 'bttv-pip')
            .on('click', togglePiP);
        $button.find('.tw-tooltip').text('Picture in Picture');
        $button
            .find('svg')
            .attr('viewBox', '0 0 128 128')
            .attr('transform', 'scale(1.3)')
            .attr('height', 20)
            .html(pipEnabledSVG);
        $button.appendTo($anchor);
    }
}

module.exports = new VideoPlayerModule();
