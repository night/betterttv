const $ = require('jquery');
const watcher = require('../../watcher');
const storage = require('../../storage');

const STORAGE_KEY = 'hideNetNeutralityBar2017';

class HideNetNeutralityModule {
    constructor() {
        watcher.on('load', () => this.hideBar());
        this.addCloseButton();
    }

    hideBar() {
        if (!storage.get(STORAGE_KEY)) return;

        $('div.app-main').toggleClass('has-net-neutrality', false);
        $('.header-announcement--net-neutrality').hide();
    }

    addCloseButton() {
        $('.header-announcement--net-neutrality .header-announcement__bar').append(`
            <div class="flex__item">
                <a href="#"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="bttv-close-net-neutrality"
                   style="font-size: 20px;font-weight: bold;color: black;">
                    &times;
                </a>
            </div>
        `);
        $('.bttv-close-net-neutrality').click(e => {
            e.preventDefault();
            storage.set(STORAGE_KEY, true);
            this.hideBar();
        });
    }
}

module.exports = new HideNetNeutralityModule();
