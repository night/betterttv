const $ = require('jquery');
const settings = require('../../settings');

class ChatInFullscreen {
    constructor() {
        settings.add({
            id: 'chatInFullscreen',
            name: 'Chat in Fullscreen',
            defaultValue: false,
            description: 'Shows chat section while in fullscreen mode.'
        });
        this.chatFsActive = false;
        settings.on('changed.chatInFullscreen', () => this.toggleChatInFullscreen());
        $(document).on('fullscreenchange mozfullscreenchange MSFullscreenChange webkitfullscreenchange', () => this.onFullScreenMoveChat());
        this.toggleChatInFullscreen();
    }

    toggleChatInFullscreen() {
        this.chatFsActive = settings.get('chatInFullscreen');
        if (this.chatFsActive) {
            $('body').addClass('bttv-chat-in-fullscreen');
            $('.video-player__container').wrapInner('<div class="chat-in-fs-wrap" />');
        } else {
            $('body').removeClass('bttv-chat-in-fullscreen');
            $('.video-player__container > .chat-in-fs-wrap').contents().unwrap();
        }
    }

    onFullScreenMoveChat() {
        const fsElement = document.fullscreenElement || document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement;

        if (fsElement && this.chatFsActive) {
            $('body').addClass('fullscreen-active');
            $('.right-column .channel-root__right-column').appendTo(fsElement);
            $('#emote-menu-for-twitch').appendTo(fsElement);
        } else {
            $('body').removeClass('fullscreen-active');
            $('.channel-root__right-column').appendTo('.right-column > .tw-block');
            $('#emote-menu-for-twitch').appendTo('body');
        }
    }
}

module.exports = new ChatInFullscreen();
