const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');

const VIDEO_PLAYER_SELECTOR = '.video-player .player';
const CANCEL_VOD_RECOMMENDATION_SELECTOR = '.recommendations-overlay .pl-rec__cancel.pl-button';

function stepPlaybackSpeed(faster) {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.props.vodID) return;
    const rates = [ 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0 ];
    let idx = rates.indexOf(currentPlayer.player.getPlaybackRate());
    if (idx === -1) return;
    idx += faster ? 1 : -1;
    if (idx < 0 || idx >= rates.length) return;
    currentPlayer.player.setPlaybackRate(rates[idx]);
}

function watchPlayerRecommendationVodsAutoplay() {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.player) return;

    currentPlayer.player.addEventListener('ended', () => {
        if (settings.get('disableVodRecommendationAutoplay') !== true) return;
        watcher.waitForLoad('vodRecommendation').then(() => $(CANCEL_VOD_RECOMMENDATION_SELECTOR).trigger('click'));
    });
}

function handleKeyEvent(keypress) {
    if (keypress.ctrlKey || keypress.metaKey) return;
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $(VIDEO_PLAYER_SELECTOR);
    if (!$player.length) return;

    switch (keypress.charCode || keypress.keyCode) {
        case keyCodes.KeyPress.LessThan:
        case keyCodes.KeyPress.Comma:
            stepPlaybackSpeed(false);
            break;
        case keyCodes.KeyPress.GreaterThan:
        case keyCodes.KeyPress.Period:
            stepPlaybackSpeed(true);
            break;
        case keyCodes.KeyPress.k:
            $player.find('.qa-pause-play-button').click();
            break;
        case keyCodes.KeyPress.f:
            $player.find('.qa-fullscreen-button').click();
            break;
        case keyCodes.KeyPress.m:
            $player.find('.qa-control-volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClick(e) {
    if (e.target !== this) {
        $('.video-player__container').focus();
        return;
    }
    clicks++;
    setTimeout(() => {
        if (clicks === 1) {
            const $player = $(VIDEO_PLAYER_SELECTOR);
            const isPaused = $player.data('paused');
            if (!isPaused) $player.find('.qa-pause-play-button').click();
        }
        clicks = 0;
    }, 250);
}

function togglePlayerCursor(hide) {
    $('body').toggleClass('bttv-hide-player-cursor', hide);
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
        settings.add({
            id: 'enableScrollVolumeControl',
            name: 'Enable Scroll Volume Control',
            defaultValue: true,
            description: 'Enables volume control by scrolling over the video player'
        });
        settings.on('changed.hidePlayerExtensions', () => this.toggleHidePlayerExtensions());
        settings.on('changed.clickToPlay', () => this.clickToPause());
        settings.on('changed.enableScrollVolumeControl', () => this.toggleVolumeControl());
        this.toggleHidePlayerExtensions();
        this.loadHidePlayerCursorFullscreen();
        this.toggleVolumeControl();
    }

    handleScroll(event) {
        const direction = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
        const delta = direction ? 0.05 : -0.05;

        const {player} = twitch.getCurrentPlayer();

        if (!player) return;

        player.setVolume(Math.min(Math.max(player.getVolume() + delta, 0), 1));

        event.preventDefault();
        event.stopPropagation();
    }

    toggleVolumeControl() {
        $(VIDEO_PLAYER_SELECTOR).off('mousewheel DOMMouseScroll', this.handleScroll);
        $('body').toggleClass('bttv-scroll-volume', settings.get('enableScrollVolumeControl'));

        if (!settings.get('enableScrollVolumeControl')) {
            return;
        }

        $(VIDEO_PLAYER_SELECTOR).on('mousewheel DOMMouseScroll', this.handleScroll);
    }

    toggleHidePlayerExtensions() {
        $('body').toggleClass('bttv-hide-player-extensions', settings.get('hidePlayerExtensions'));
    }

    keybinds() {
        $(document).on('keypress.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $(VIDEO_PLAYER_SELECTOR).off('click', '.player-overlay.pl-overlay__fullscreen,.player-video,.js-paused-overlay', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $(VIDEO_PLAYER_SELECTOR).on('click', '.player-overlay.pl-overlay__fullscreen,.player-video,.js-paused-overlay', handlePlayerClick);
        }
    }

    loadHidePlayerCursorFullscreen() {
        const hidePlayerCursor = debounce(() => togglePlayerCursor(true), 5000);
        $('body').on('mousemove', '.video-player--fullscreen', () => {
            togglePlayerCursor(false);
            hidePlayerCursor();
        });
    }
}

module.exports = new VideoPlayerModule();
