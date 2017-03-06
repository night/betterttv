const $ = require('jquery');
const watcher = require('../../watcher');

const CHAT_STATE_ID = 'bttv-channel-state-contain';
const CHAT_STATE_TEMPLATE = require('./template')(CHAT_STATE_ID);
const CHAT_HEADER_SELECTOR = '.ember-chat .chat-header:first';

function displaySeconds(s) {
    let date = new Date(0);
    date.setSeconds(s);
    date = date.toISOString().substr(11, 8);
    date = date.split(':');

    while (date[0] === '00') {
        date.shift();
    }

    if (date.length === 1 && date[0].charAt(0) === '0') {
        date[0] = parseInt(date[0], 10);
    }

    return date.join(':');
}

class ChatCustomTimeoutsModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
        watcher.on('chat.state', state => this.updateState(state));
    }

    load() {
        if ($(`#${CHAT_STATE_ID}`).length) return;
        $(CHAT_HEADER_SELECTOR).append(CHAT_STATE_TEMPLATE);

        $(`#${CHAT_STATE_ID}`).children().each(function() {
            $(this).hide();

            if ($(this).hasClass('slow')) {
                jQuery(this).find('.slow-time').tipsy({
                    gravity: jQuery.fn.tipsy.autoNS
                });
                jQuery(this).find('svg').tipsy({
                    gravity: jQuery.fn.tipsy.autoNS
                });
            } else {
                jQuery(this).tipsy({
                    gravity: jQuery.fn.tipsy.autoNS
                });
            }
        });

        this.updateState({});
    }

    updateState(state) {
        const $stateContainer = $(`#${CHAT_STATE_ID}`);
        if (!$stateContainer.length) return;

        if (state.slow) {
            $stateContainer
                .find('.slow-time')
                .attr('original-title', `${state.slow} seconds`)
                .text(displaySeconds(state.slow));
        }
        $stateContainer.find('.slow').toggle(state.slow ? true : false);
        $stateContainer.find('.slow-time').toggle(state.slow ? true : false);

        $stateContainer.find('.r9k').toggle(state.r9k ? true : false);

        $stateContainer.find('.subs-only').toggle(state.subsOnly ? true : false);

        $stateContainer.find('.emote-only').toggle(state.emoteOnly ? true : false);
    }
}

module.exports = new ChatCustomTimeoutsModule();
