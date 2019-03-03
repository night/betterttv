const $ = require('jquery');
const settings = require('../../settings');
const twitchAPI = require('../../utils/twitch-api');

class EmbeddedChatClips {
    constructor() {
        settings.add({
            id: 'embeddedChatClips',
            name: 'Chat Embedded Clips',
            defaultValue: true,
            description: 'Play linked clips straight from chat'
        });
    }

    render($el) {
        if (settings.get('embeddedChatClips') === false) return;

        const $clipContainer = $el.find('.link-fragment');

        const url = $clipContainer.attr('href');
        if (url.length === 0 || url.indexOf('clips.twitch.tv') === -1) return;

        const slug = url.split('/').pop();
        if (slug.length === 0) return;

        twitchAPI.get(`clips/${slug}`).then(response => {
            const $iframe = $(response.embed_html);

            $iframe.removeAttr('width height').on('load', () => {
                const player = $iframe.contents().find('video');

                const stopAutoplay = () => {
                    setTimeout(() => {
                        player.get(0).pause();
                        player.attr('loop', true);
                    }, 0);
                    player.off('play', stopAutoplay);
                };

                player.on('play', stopAutoplay);
            });

            $el.addClass('bttv_embedded_clip');
            $clipContainer.replaceWith($iframe);
        });
    }
}

module.exports = new EmbeddedChatClips();
