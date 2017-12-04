const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

const CARET_BUTTON_SELECTOR = '.pinned-cheer__expand-caret';
const TOPCHEER_PARENT_SELECTOR = '.chat-room__pane';

const closeButtonTemplate = `
    <button aria-label="Close" class="tw-button-icon bttv-topcheer-close">
        <span class="tw-button-icon__icon">
            <figure class="svg-figure">
                <svg class="svg svg--close svg--inherit" width="16px" height="16px" version="1.1" viewBox="0 0 16 16" x="0px" y="0px"><path d="M8 6.586L3.757 2.343 2.343 3.757 6.586 8l-4.243 4.243 1.414 1.414L8 9.414l4.243 4.243 1.414-1.414L9.414 8l4.243-4.243-1.414-1.414" fill-rule="evenodd"></path></svg>
            </figure>
        </span>
    </button>
`;

class HideTopcheerModule {
    constructor() {
        settings.add({
            id: 'hideTopcheer',
            name: 'Hide Top Cheer',
            defaultValue: false,
            description: 'Unclutter your chat, hide the top cheer!'
        });

        watcher.on('load.chat', () => {
            this.autoHide();

            this.waitFor(CARET_BUTTON_SELECTOR)
                .then(() => this.load());
        });

        settings.on('changed.hideTopcheer', () => this.autoHide());

        $('body').on('click', '.bttv-topcheer-close', e => {
            e.preventDefault();
            e.stopPropagation();
            this.unpin();
        });
    }

    waitFor(selector) {
        return new Promise(resolve => {
            const intervalHandler = setInterval(() => {
                const $el = $(selector);
                if ($el[0]) {
                    resolve($el);
                    clearInterval(intervalHandler);
                }
            }, 25);
        });
    }

    load() {
        const $close = $(closeButtonTemplate);
        $close.insertAfter(CARET_BUTTON_SELECTOR);
    }

    autoHide() {
        if (settings.get('hideTopcheer')) {
            this.unpin();
        }
    }

    unpin() {
        $(TOPCHEER_PARENT_SELECTOR).addClass('bttv-hide-topcheer');
    }

    show() {
        $(TOPCHEER_PARENT_SELECTOR).removeClass('bttv-hide-topcheer');
    }
}


module.exports = new HideTopcheerModule();
