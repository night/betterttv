const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');

function handleKeyEvent(keyup) {
    if (keyup.ctrlKey || keyup.metaKey || keyup.shiftKey) return;
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $('#player');
    if (!$player.length) return;

    switch (keyup.keyCode) {
        case keyCodes.k:
            $player.find('.js-control-playpause-button').click();
            break;
        case keyCodes.f:
            $player.find('.js-control-fullscreen').click();
            break;
        case keyCodes.m:
            $player.find('.player-button--volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClickToPause() {
    clicks++;
    setTimeout(() => {
        if (clicks === 1) {
            const $player = $('#player');
            const isPaused = $player.data('paused');
            const playerService = App.__container__.lookup('service:persistent-player');
            if (!playerService || !playerService.playerComponent || !playerService.playerComponent.player) return;
            if (!isPaused) playerService.playerComponent.player.pause();
        }
        clicks = 0;
    }, 250);
}

function handlePlayerClickToToggleMute() {
    clicks++;
    setTimeout(() => {
        if (clicks === 1) {
            const playerService = App.__container__.lookup('service:persistent-player');
            if (!playerService || !playerService.playerComponent || !playerService.playerComponent.player) return;
            const isMuted = playerService.playerComponent.player.getMuted();
            playerService.playerComponent.player.setMuted( !isMuted );
        }
        clicks = 0;
    }, 250);
}

class VideoPlayerModule {
    constructor() {
        this.keybinds();
        watcher.on('load.channel', () => this.registerClickHandler());
        watcher.on('load.vod', () => this.registerClickHandler());
        settings.add({
            id: 'clickToPlay',
            name: 'Click to Play/Pause Stream',
            defaultValue: false,
            description: 'Click on the twitch player to pause/resume playback'
        });
        settings.add({
            id: 'clickToMute',
            name: 'Click to Mute/Unmute Stream',
            defaultValue: false,
            description: 'Click on the twitch player to mute/unmute it'
        });
        settings.on('changed.clickToPlay', () => this.handleClickSettingChanged('clickToPlay', 'clickToMute'));
        settings.on('changed.clickToMute', () => this.handleClickSettingChanged('clickToMute', 'clickToPlay'));
    }

    keybinds() {
        $(document).on('keyup.playerControls', handleKeyEvent);
    }

    handleClickSettingChanged(thisSettingId, otherSettingId) {
        if (settings.get(thisSettingId) === true) {
            settings.set(otherSettingId, false, false);
            $(`#${otherSettingId}False`).prop('checked', true);
        }
        this.registerClickHandler();
    }

    registerClickHandler() {
        $('#player').off('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClickToPause);
        $('#player').off('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClickToToggleMute);

        if (settings.get('clickToPlay') === true) {
            $('#player').on('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClickToPause);
        } else if (settings.get('clickToMute') === true) {
            $('#player').on('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClickToToggleMute);
        }
    }
}

module.exports = new VideoPlayerModule();
