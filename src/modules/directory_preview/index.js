const settings = require('../../settings');

const PREVIEW_SELECTOR = '#directory-list .js-streams figure.card__img a';

class DirectoryPreviewModule {
    constructor() {
        settings.add({
            id: 'directoryPreview',
            name: 'Directory Preview',
            defaultValue: false,
            description: 'Hover over streams to get a live preview of the stream'
        });
        settings.on('changed.directoryPreview', value => value === true ? this.load() : this.unload());
        this.load();
    }

    load() {
        if (settings.get('directoryPreview') === false) return;

        // relies on Twitch jQuery
        try {
            jQuery('body')
                .on('mouseover', PREVIEW_SELECTOR, ({currentTarget}) => {
                    const $target = jQuery(currentTarget);
                    const chan = encodeURIComponent($target.attr('href').substr(1));

                    jQuery('div.tipsy').remove();

                    setTimeout(() => {
                        if (!$target.is(':hover')) return;

                        jQuery('div.tipsy').remove();
                        $target.tipsy({
                            trigger: 'manual',
                            gravity: jQuery.fn.tipsy.autoWE,
                            html: true,
                            opacity: 1,
                            title: () => `
                                <iframe src="https://player.twitch.tv/?channel=${chan}&!branding&!showInfo&autoplay&volume=0.1"
                                        style="border: none;"
                                        width="320"
                                        height="208"></iframe>
                                <style>.tipsy-inner{max-width:320px;}</style>`
                        });
                        $target.tipsy('show');
                    }, 1500);
                })
                .on('mouseout', PREVIEW_SELECTOR, ({currentTarget}) => {
                    const $target = jQuery(currentTarget);

                    if (!jQuery('div.tipsy').length) return;

                    const timer = setInterval(() => {
                        if (jQuery('div.tipsy').length && jQuery('div.tipsy').is(':hover')) return;

                        clearInterval(timer);
                        $target.tipsy('hide');
                    }, 1000);
                })
                .on('click', PREVIEW_SELECTOR, ({currentTarget}) => {
                    jQuery(currentTarget).tipsy('hide');
                    jQuery('div.tipsy').remove();
                });
        } catch (e) {}
    }

    unload() {
        // relies on Twitch jQuery
        try {
            jQuery('body')
                .off('mouseover', PREVIEW_SELECTOR)
                .off('mouseout', PREVIEW_SELECTOR);
        } catch (e) {}
    }
}

module.exports = new DirectoryPreviewModule();
