import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import {SettingIds} from '../../constants.js';
import EmoteMenu from './components/Button.jsx';
import domObserver from '../../observers/dom.js';

const EMOTE_PICKER_BUTTON_SELECTOR = "button[data-a-target='emote-picker-button']";
const CHAT_INPUT_ICONS_SELECTOR = '.chat-input__input-icons';
const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR = '#bttvEmoteMenuContainer';

class EmoteMenuModule {
  constructor() {
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.load());
    watcher.on('load.chat', () => this.load());
    domObserver.on(CHAT_INPUT_ICONS_SELECTOR, () => {
      this.embedEmoteMenu();
    });
  }

  async embedEmoteMenu() {
    if ($(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR).length) return;
    const panel = document.createElement('div');
    panel.setAttribute('id', 'bttvEmoteMenuContainer');
    $(CHAT_INPUT_ICONS_SELECTOR).append(panel);
    ReactDOM.render(<EmoteMenu />, panel);
  }

  async load() {
    const emotePickerButton = $(EMOTE_PICKER_BUTTON_SELECTOR);
    const bttvEmotePickerButton = $(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);

    if (settings.get(SettingIds.CLICK_TWITCH_EMOTES)) {
      emotePickerButton.hide();
      bttvEmotePickerButton.show();
    } else {
      emotePickerButton.show();
      bttvEmotePickerButton.hide();
    }
  }
}

export default new EmoteMenuModule();
