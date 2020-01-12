const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');

const VIDEO_PLAYER_SELECTOR = '.video-player__container';
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

let isMuted = false;
let isUnloading = false;

function onWindowBlur() {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.player || isUnloading) return;
    isMuted = currentPlayer.player.getMuted();
    currentPlayer.player.setMuted(true);
}

function onWindowFocus() {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.player) return;
    currentPlayer.player.setMuted(isMuted);
}

function onVisibilityChange() {
    if (document.hidden) {
        onWindowBlur();
    } else {
        onWindowFocus();
    }
}

function setUnloading() {
    isUnloading = true;
}

function muteInvisibleTabs() {
    $(document).off('visibilitychange', onVisibilityChange);
    $(window).off('beforeunload', setUnloading);

    if (settings.get('muteInvisibleTabs')) {
        $(document).on('visibilitychange', onVisibilityChange);
        $(window).on('beforeunload', setUnloading);
    }
}

class VideoPlayerModule {
    constructor() {
        this.keybinds();
        watcher.on('load.player', () => {
            this.clickToPause();
            watchPlayerRecommendationVodsAutoplay();

            const currentPlayer = twitch.getCurrentPlayer();
            isMuted =
                currentPlayer &&
                currentPlayer.player &&
                currentPlayer.player.getMuted();

            muteInvisibleTabs();
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
            id: 'muteInvisibleTabs',
            name: 'Mute Streams in Invisible Tabs',
            defaultValue: false,
            description: 'Automatically mute/unmute streams so only visible tabs have audio'
        });
        settings.on('changed.hidePlayerExtensions', () => this.toggleHidePlayerExtensions());
        settings.on('changed.clickToPlay', () => this.clickToPause());
        settings.on('changed.muteInvisibleTabs', muteInvisibleTabs);
        this.toggleHidePlayerExtensions();
        this.loadHidePlayerCursorFullscreen();
    }

    toggleHidePlayerExtensions() {
        $('body').toggleClass('bttv-hide-player-extensions', settings.get('hidePlayerExtensions'));
    }

    keybinds() {
        $(document).on('keydown.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $(VIDEO_PLAYER_SELECTOR).off('click', '.video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $(VIDEO_PLAYER_SELECTOR).on('click', '.video-player__overlay div[data-a-target="player-overlay-click-handler"]', handlePlayerClick);
        }
    }

    loadHidePlayerCursorFullscreen() {
        const hidePlayerCursor = debounce(() => togglePlayerCursor(true), 5000);
        $('body').on('mousemove', 'div[data-test-selector="video-player__video-layout"]', () => {
            togglePlayerCursor(false);
            hidePlayerCursor();
        });
    }
}

module.exports = new VideoPlayerModule();
