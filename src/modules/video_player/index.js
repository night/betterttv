const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');

const VIDEO_PLAYER_SELECTOR = '.video-player .player';

function handleKeyEvent(keyup) {
    if (keyup.ctrlKey || keyup.metaKey || keyup.shiftKey) return;
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $(VIDEO_PLAYER_SELECTOR);
    if (!$player.length) return;

    switch (keyup.keyCode) {
        case keyCodes.k:
            $player.find('.qa-pause-play-button').click();
            break;
        case keyCodes.f:
            $player.find('.qa-fullscreen-button').click();
            break;
        case keyCodes.m:
            $player.find('.qa-control-volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClick() {
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

class VideoPlayerModule {
    constructor() {
        this.toggleHidePlayerExtensions();
        this.keybinds();
        watcher.on('load.player', () => this.clickToPause());
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
        settings.on('changed.hidePlayerExtensions', () => this.toggleHidePlayerExtensions());
        settings.on('changed.clickToPlay', () => this.clickToPause());
    }

    toggleHidePlayerExtensions() {
        $('body').toggleClass('bttv-hide-player-extensions', settings.get('hidePlayerExtensions'));
    }

    keybinds() {
        $(document).on('keyup.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $(VIDEO_PLAYER_SELECTOR).off('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $(VIDEO_PLAYER_SELECTOR).on('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);
        }
    }
}

module.exports = new VideoPlayerModule();
