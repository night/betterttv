const $ = require('jquery');
const debug = require('../../utils/debug');
const settings = require('../../settings');

class EmoteMenuModule {
    constructor() {
        settings.add({
            id: 'clickTwitchEmotes',
            name: 'Emote Menu',
            defaultValue: false,
            description: 'Get a more advanced emote menu for Twitch. (Made by Ryan Chatham)'
        });
        settings.on('changed.clickTwitchEmotes', () => this.load());
        this.load();
    }

    load() {
        if (window.emoteMenu) {
            if (settings.get('clickTwitchEmotes') === true) {
                $('#emote-menu-button').show();
            } else {
                $('#emote-menu-button').hide();
            }

            return;
        }

        // Inject the emote menu if option is enabled.
        if (settings.get('clickTwitchEmotes') === false) return;

        debug.log('Injecting Twitch Chat Emotes Script');

        require('twitch-chat-emotes/script.min');

        // Try hooking into the emote menu, regardless of whether we injected or not.
        let counter = 0;
        const getterInterval = setInterval(() => {
            counter++;

            if (counter > 29) {
                clearInterval(getterInterval);
                return;
            }

            if (window.emoteMenu) {
                clearInterval(getterInterval);
                debug.log('Hooking into Twitch Chat Emotes Script');
                // TODO: hook up custom emotes
                // window.emoteMenu.registerEmoteGetter('BetterTTV', bttv.chat.emotes);
            }
        }, 1000);
    }
}

module.exports = new EmoteMenuModule();
