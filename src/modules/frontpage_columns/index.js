const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

const CONTAINER_CLASS = '.fp-container';
const BUTTONS_HTML = `
<div class="bttv-frontpage-buttons">
    <a class="bttv-fp-pulse-button" href="#">Pulse only</a>
    -
    <a class="bttv-fp-featured-button" href="#">Featured only</a>
    -
    <a class="bttv-fp-both-button" href="#">Both</a>
</div>
`;

class FrontpageColumnsModule {
    constructor() {
        watcher.on('load.frontpage', () => this.load());
    }

    load() {
        const $container = $('.fp-container');
        if ($container.length === 0) return;

        $(CONTAINER_CLASS).prepend(BUTTONS_HTML);
        $('.bttv-fp-pulse-button').click(() => this.updateClass('pulse-only'));
        $('.bttv-fp-featured-button').click(() => this.updateClass('featured-only'));
        $('.bttv-fp-both-button').click(() => this.updateClass());

        const storedClass = settings.get('frontpageColumns');
        if (storedClass) $container.addClass(storedClass);
    }

    updateClass(newClass) {
        const $container = $('.fp-container');
        $container.removeClass('pulse-only');
        $container.removeClass('featured-only');
        if (newClass) $container.addClass(newClass);
        settings.set('frontpageColumns', newClass);
    }
}

module.exports = new FrontpageColumnsModule();
