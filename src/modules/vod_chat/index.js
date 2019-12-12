const $ = require('jquery');
const chat = require('../chat');
const nicknames = require('../chat_nicknames');
const watcher = require('../../watcher');
const colors = require('../../utils/colors');
const chatSettings = require('../chat_settings');

const CHAT_MESSAGE_SELECTOR = '.video-chat__message span[data-a-target="chat-message-text"]';
const CHAT_FROM_SELECTOR = '.video-chat__message-author';
const CHAT_USER_SELECTOR = '.chat-author__display-name,.chat-author__intl-login';
const SCROLL_INDICATOR_SELECTOR = '.video-chat__sync-button';
const SCROLL_CONTAINER_SELECTOR = '.video-chat__message-list-wrapper';
const COLOR_REGEX = /rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/;
const CHAT_HEADER = '.video-chat__header';
const CHAT_SETTINGS_BUTTON_SELECTOR = '.bttv-vod-settings-button';
const CHAT_SETTINGS_WINDOW_CLOSE_BUTTON_SELECTOR = '.bttv-vod-chat-close-button';
const CHAT_SETTINGS_WINDOW_SELECTOR = '.bttv-vod-settings-window';
const CHAT_SETTINGS_BUTTON_TEMPLATE = `
<div class="tw-absolute tw-mg-r-1 tw-right-0 bttv-vod-settings-button">
    <div class="tw-inline-flex tw-relative tw-tooltip-wrapper">
        <button class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-core-button tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative" data-a-target="chat-settings" aria-label="Chat Settings">
            <span class="tw-button-icon__icon">
                <div style="width: 2rem; height: 2rem;">
                    <div class="tw-align-items-center tw-full-width tw-icon tw-icon--fill tw-inline-flex">
                        <div class="tw-aspect tw-aspect--align-top">
                            <div class="tw-aspect__spacer" style="padding-bottom: 100%;"></div>
                            <svg class="tw-icon__svg" width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
                                <g>
                                    <path fill-rule="evenodd" d="M9 2h2a2.01 2.01 0 001.235 1.855l.53.22a2.01 2.01 0 002.185-.439l1.414 1.414a2.01 2.01 0 00-.439 2.185l.22.53A2.01 2.01 0 0018 9v2a2.01 2.01 0 00-1.855 1.235l-.22.53a2.01 2.01 0 00.44 2.185l-1.415 1.414a2.01 2.01 0 00-2.184-.439l-.531.22A2.01 2.01 0 0011 18H9a2.01 2.01 0 00-1.235-1.854l-.53-.22a2.009 2.009 0 00-2.185.438L3.636 14.95a2.009 2.009 0 00.438-2.184l-.22-.531A2.01 2.01 0 002 11V9c.809 0 1.545-.487 1.854-1.235l.22-.53a2.009 2.009 0 00-.438-2.185L5.05 3.636a2.01 2.01 0 002.185.438l.53-.22A2.01 2.01 0 009 2zm-4 8l1.464 3.536L10 15l3.535-1.464L15 10l-1.465-3.536L10 5 6.464 6.464 5 10z" clip-rule="evenodd"></path>
                                    <path d="M10 8a2 2 0 100 4 2 2 0 000-4z"></path>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </span>
        </button>
        <div class="tw-tooltip tw-tooltip--align-right tw-tooltip--down" data-a-target="tw-tooltip-label" role="tooltip" id="7b97ed164026a43d9ae2c415eff1b94d">Chat settings</div>
    </div>
</div>
`;

const CHAT_SETTINGS_WINDOW_TEMPLATE = `
<div class="bttv-vod-settings-window tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-top-0 tw-z-default" data-a-target="chat-settings-balloon" role="dialog" style="margin-top: 5.1rem;">
    <div class="tw-border-radius-large tw-c-background-base tw-c-text-inherit tw-elevation-2">
        <div class="chat-settings__popover">
            <div class="chat-settings__header tw-align-items-center tw-c-background-base tw-flex tw-pd-x-1 tw-relative">
                <div class="chat-settings__back-icon-container tw-left-0 tw-mg-r-05"></div>
                <div class="tw-align-center tw-align-items-center tw-flex tw-flex-grow-1 tw-justify-content-center">
                    <p class="tw-c-text-alt tw-font-size-5 tw-semibold">VOD chat settings</p>
                </div>
                <div class="tw-mg-l-05 tw-right-0">
                    <button class="bttv-vod-chat-close-button tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-core-button tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative" data-test-selector="chat-settings-close-button-selector" aria-label="Close">
                        <span class="tw-button-icon__icon">
                            <div style="width: 2rem; height: 2rem;">
                                <div class="tw-align-items-center tw-full-width tw-icon tw-icon--fill tw-inline-flex">
                                    <div class="tw-aspect tw-aspect--align-top">
                                        <div class="tw-aspect__spacer" style="padding-bottom: 100%;"></div>
                                        <svg class="tw-icon__svg" width="100%" height="100%" version="1.1" viewBox="0 0 20 20" x="0px" y="0px">
                                            <g>
                                                <path d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </span>
                    </button>
                </div>
            </div>
            <div>
                <div class="chat-settings__content tw-c-background-base tw-c-text-base tw-pd-1">
                </div>
            </div>
        </div>
    </div>
</div>
</div>
`;

function scrollOnEmoteLoad($el) {
    const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
    if (indicator) return;
    $el.find('img.bttv').on('load', () => {
        const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class VODChatModule {
    constructor() {
        watcher.on('vod.message', $el => this.parseMessage($el));
        watcher.on('load.vod', () => $('textarea[data-a-target="video-chat-input"]').attr('maxlength', '500'));
        watcher.on('load.player', () => this.renderSettings());
    }

    renderSettings() {
        if (!$(CHAT_HEADER).length) {
            setTimeout(() => this.renderSettings(), 100);
        }
        $(CHAT_HEADER).append(CHAT_SETTINGS_BUTTON_TEMPLATE);
        $(CHAT_SETTINGS_WINDOW_TEMPLATE).insertAfter(CHAT_SETTINGS_BUTTON_SELECTOR).hide();
        chatSettings.load();
        $(CHAT_SETTINGS_WINDOW_CLOSE_BUTTON_SELECTOR).on('click', () => {
            $(CHAT_SETTINGS_WINDOW_SELECTOR).hide();
        });

        $(CHAT_SETTINGS_BUTTON_SELECTOR).on('click', () => {
            if ($(CHAT_SETTINGS_WINDOW_SELECTOR).is(':visible')) {
                $(CHAT_SETTINGS_WINDOW_SELECTOR).hide();
            } else {
                $(CHAT_SETTINGS_WINDOW_SELECTOR).show();
            }
        });
    }

    parseMessage($element) {
        const $from = $element.find(CHAT_FROM_SELECTOR);
        const $username = $from.find(CHAT_USER_SELECTOR);

        const colorRaw = $username.css('color');
        const colorRgb = COLOR_REGEX.exec(colorRaw);
        const color = colorRgb ? colors.getHex({r: colorRgb[1], g: colorRgb[2], b: colorRgb[3]}) : null;

        const mockUser = {
            name: $from.attr('href').split('?')[0].split('/').pop(),
            color
        };

        if (mockUser.color) {
            const newColor = chat.calculateColor(mockUser.color);
            $username.css('color', newColor);

            if ($element[0].style.color) {
                $element.css('color', newColor);
            }
        }

        const nickname = nicknames.get(mockUser.name);
        if (nickname) {
            $username.text(nickname);
        }

        const $message = $element.find(CHAT_MESSAGE_SELECTOR);
        chat.messageReplacer($message, mockUser);

        scrollOnEmoteLoad($element);
    }
}

module.exports = new VODChatModule();
