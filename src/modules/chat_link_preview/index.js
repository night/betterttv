const $ = require('jquery');
const api = require('../../utils/api');
const watcher = require('../../watcher');
const debounce = require('lodash.debounce');
const settings = require('../../settings');

const CHAT_LINES_SELECTOR = '.chat-list__lines';
const CHAT_LINK_SELECTOR = '.link-fragment';
const IMAGE_REGEX = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv|webm|mp4))', 'i');

function tooltip($url, body) {
    const $tooltip = $('<div />');
    $tooltip.addClass('tw-tooltip-wrapper').addClass('inline');
    $tooltip.html(`
        <div class="tw-tooltip tw-tooltip--up tw-tooltip--align-center" data-a-target="tw-tooltip-label" style="width: 250px;
        white-space: normal;">
            ${body}
        </div>
    `);
    $tooltip.find('.tw-tooltip').before($url.clone());
    return $tooltip;
}

const enter = debounce(function() {
    const url = this.href;
    const $target = $(this);

    if ($target.parent().hasClass('tw-tooltip-wrapper')) return;

    const previewType = IMAGE_REGEX.test(url) ? 'image_embed' : 'link_resolver';

    if (previewType === 'image_embed' && settings.get('chatImagePreview') === false) return;

    api.get(
        `${previewType}/${encodeURIComponent(url)}`,
        {dataType: previewType === 'image_embed' ? 'html' : 'json'}
    ).then(data => {
        if (!$target.length || !$target.is(':hover')) return;
        $target.replaceWith(tooltip($target, typeof data === 'string' ? data : data.tooltip));
    });
}, 250);

function leave() {
    enter.cancel();
}

class ChatLinkPreviewModule {
    constructor() {
        settings.add({
            id: 'chatImagePreview',
            name: 'Chat Image Preview',
            defaultValue: true,
            description: 'Preview chat images on mouse over'
        });

        watcher.on('load.chat', () => this.load());
    }
    load() {
        $(CHAT_LINES_SELECTOR)
            .off({
                mouseenter: enter,
                mouseleave: leave
            }, CHAT_LINK_SELECTOR)
            .on({
                mouseenter: enter,
                mouseleave: leave
            }, CHAT_LINK_SELECTOR);
    }
}

module.exports = new ChatLinkPreviewModule();
