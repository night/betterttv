const settings = require('../../settings');

class NotificationSoundModule {
    constructor() {
        settings.add({
            id: 'highlightFeedback',
            name: 'Play Sound on Highlight/Whisper',
            description: 'Get audio feedback for messages directed at you',
            defaultValue: false,
        });

        settings.on('changed.highlightFeedback', () => this.load());
        this.load();
    }

    load() {
        if (settings.get('highlightFeedback') !== true) return;
        this.sound = new Audio('https://cdn.betterttv.net/assets/sounds/ts-tink.ogg');
    }

    play(ignoreFocus = false) {
        if (!ignoreFocus && document.hasFocus()) return;
        if (settings.get('highlightFeedback') !== true) return;
        console.log(this.sound.paused);
        this.sound.pause();
        this.sound.currentTime = 0;
        this.sound.play();
    }
}

module.exports = new NotificationSoundModule();
