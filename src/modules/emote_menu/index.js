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
        watcher.on('load.chat', () => this.load());
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

        debug.log('Hooking into Twitch Chat Emotes Script');
        try { // try/catch protects against re-registered emote getters
            window.emoteMenu.registerEmoteGetter('BetterTTV', () =>
                emotes.getEmotes(['bttv-emoji']).map(({code, images, provider}) => {
                    return {
                        text: code,
                        channel: provider.displayName,
                        badge: provider.badge,
                        url: images['2x']
                    };
                })
            );
        } catch (e) {}
    }
}

module.exports = new EmoteMenuModule();
