const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

const optionId = 'adaptivePositionChat';
const widthTreshold = 500;

let observer;
let observeTarget;
let attached = false;
let intTimer;
let toTimer;

// i really don't like this observe+timers thing,
// but i'm not sure how to make it better
function createTimer($element) {
    if (toTimer) {
        clearTimeout(toTimer);
    } else {
        intTimer = setInterval(() => $element.is(':visible') || $element.css('display', ''), 1000 / 60);
    }

    toTimer = setTimeout(() => {
        clearInterval(intTimer);
        clearTimeout(toTimer);
        intTimer = toTimer = undefined;
    }, 2000);
}

function observe($element) {
    if (observeTarget === $element[0]) {
        return;
    }

    observeTarget = $element[0];
    observer && observer.disconnect();
    observer = new window.MutationObserver(mutations => {
        if (mutations.find(m => m.type === 'attributes' && m.attributeName === 'style')) {
            $element.css('display', '');
        }
    });
    observer.observe(observeTarget, { attributes: true });

    createTimer($element);
}

function getChatStyles($infobar) {
    const top    = $infobar.position().top + $infobar.outerHeight() + $infobar.closest('.simplebar-scroll-content').scrollTop();
    const height = window.innerHeight - $infobar.parent().offset().top - top;

    return {
        top: [top + 'px'],
        height: [height + 'px', 'important']
    };
}

function adapt(state) {
    const enable  = typeof state === 'boolean' ? state : window.innerWidth > widthTreshold && window.innerHeight / window.innerWidth > 1.1;
    const $main   = $('main');
    const $header = $main.find('.channel-header').parent();

    let $chat = $main.siblings('.right-column');
    if (!$chat.length) {
        $chat = $header.siblings('.right-column');
    }

    if (enable) {
        const $container = $header.parent().append($chat);
        const $infobar   = $container.find('.channel-info-bar');
        const styles     = getChatStyles($infobar);

        let $dummy = $container.children('.bttv-adaptive-chat__dummy');
        if (!$dummy.length) {
            $dummy = $('<div class="bttv-adaptive-chat__dummy"/>').appendTo($container);
        }
        $dummy.css('height', styles.height[0]);

        $chat.each(function() {
            Object.keys(styles).forEach(prop => {
                const css = styles[prop];
                this.style.setProperty(prop, css[0], css[1]);
            });
        }).css('display', '');

        // twitch forces inline style "display: none" on small screens
        observe($chat);
    } else {
        $chat.insertAfter($main).attr('style', null);
    }

    $('body').toggleClass('bttv-adaptive-chat', enable);
}

function onResize() {
    adapt();
}

function onScroll() {
    const $header = $('.bttv-adaptive-chat main .channel-header').parent();
    const $chat   = $header.siblings('.right-column');

    if ($chat.length) {
        const $infobar = $header.parent().find('.channel-info-bar');
        const styles   = getChatStyles($infobar);

        $chat.each(function() {
            Object.keys(styles).forEach(prop => {
                const css = styles[prop];
                this.style.setProperty(prop, css[0], css[1]);
            });
        });
    }
}

class ChatAdaptivePosition {
    constructor() {
        settings.add({
            id: optionId,
            name: 'Adaptive chat',
            defaultValue: false,
            description: 'Moves chat below the player on vertical screens'
        });

        watcher.on('load.chat', () => {
            const listener = () => this.toggle(settings.get(optionId));
            settings.on('changed.' + optionId, listener);
            listener();
        });
    }

    toggle(enable) {
        const state = enable === undefined ? !attached : !!enable;
        if (state === attached) {
            return;
        }

        attached = state;
        if (state) {
            $(window).on('resize.' + optionId, onResize);
            $('main .simplebar-scroll-content').on('scroll.' + optionId, onScroll);
            onResize();
        } else {
            observer && observer.disconnect();
            $(window).off('resize.' + optionId);
            $('main .simplebar-scroll-content').off('scroll.' + optionId);
            adapt(false);
        }
    }
}

module.exports = new ChatAdaptivePosition();
