const $ = require('jquery');
const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');
const emotes = require('../emotes');

class EmoteMenuModule {
    constructor() {
        settings.add({
            id: 'clickTwitchEmotes',
            name: 'Emote Menu',
            defaultValue: false,
            description: 'Get a more advanced emote menu for Twitch. (Made by Ryan Chatham)'
        });
        settings.on('changed.clickTwitchEmotes', () => this.load());
        watcher.on('load.chat_settings', () => this.load());
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

        // Emote menu doesn't handle loads on non-chat pages well
        if (!$('.js-chat-interface').length) return;

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

            if (!window.emoteMenu) return;
            clearInterval(getterInterval);

            debug.log('Hooking into Twitch Chat Emotes Script');

            window.emoteMenu.registerEmoteGetter('BetterTTV', () =>
                emotes.getEmotes().map(({code, images, provider}) => {
                    return {
                        text: code,
                        channel: provider.displayName,
                        badge: provider.badge,
                        url: images['1x']
                    };
                })
            );
        }, 1000);
    }
}

module.exports = new EmoteMenuModule();
