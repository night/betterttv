const $ = require('jquery');
const api = require('../../utils/api');
const watcher = require('../../watcher');
const debounce = require('lodash.debounce');

const IMAGE_REGEX = new RegExp('(https?:\/\/.)([a-z\-_0-9\/\:\.\%\+]*\.(jpg|jpeg|png|gif|gifv|webm))', 'i');

const enter = debounce(function() {
    const url = this.href;
    const $target = jQuery(this);

    const previewType = IMAGE_REGEX.test(url) ? 'image_embed' : 'link_resolver';

    api.get(`${previewType}/${encodeURIComponent(url)}`).done(data => {
        if (!$target.length || !$target.is(':hover')) return;

        $target.tipsy({
            trigger: 'manual',
            gravity: jQuery.fn.tipsy.autoNS,
            html: true,
            title: () => typeof data === 'string' ? data : data.tooltip
        });
        $target.tipsy('show');
    });
}, 250);

function leave() {
    enter.cancel();
    jQuery(this).tipsy('hide');
    $('div.tipsy').remove();
}

class ChatLinkPreviewModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $('#right_col .chat-messages .chat-lines')
        .off({
            mouseenter: enter,
            mouseleave: leave
        }, '.chat-line .message a')
        .on({
            mouseenter: enter,
            mouseleave: leave
        }, '.chat-line .message a');
    }
}

module.exports = new ChatLinkPreviewModule();
