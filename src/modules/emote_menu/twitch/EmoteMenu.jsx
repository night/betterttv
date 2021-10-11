import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getReactInstance} from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import SafeEmoteMenuButton from '../components/SafeEmoteMenu.jsx';

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';

let togglePopover;
function setPopoverOpen({current}) {
  togglePopover = () => {
    if (current.state.isOverlayShown) {
      current.close();
    } else {
      current.open();
    }
  };
}

let mountedNode = null;

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadLegacyButton();
    });
    watcher.on('load.chat', () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.loadLegacyButton());
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (clickTwitchEmotes && legacyContainer == null) {
      const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
      if (container == null) {
        return;
      }
      const rightContainer = container.lastChild;
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add(styles.emotePickerButtonContainer);
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      rightContainer.insertBefore(buttonContainer, rightContainer.lastChild);

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <SafeEmoteMenuButton
          classname={styles.popover}
          onError={() => this.show(false)}
          onMount={() => this.show(true)}
          onClick={() => togglePopover()}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
        />,
        buttonContainer
      );
      mountedNode = buttonContainer;
    }

    this.show(true);
  }

  show(visible) {
    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (legacyContainer == null) {
      return;
    }

    legacyContainer.classList.toggle(styles.hideEmoteMenuButton, !visible || !clickTwitchEmotes);
  }

  appendToChat({code: text}, shouldFocus = true) {
    const element = document.querySelector(CHAT_TEXT_AREA);

    const {value: currentValue, selectionStart} = element;
    let prefixText = currentValue.substring(0, element.selectionStart);
    let suffixText = currentValue.substring(element.selectionEnd, currentValue.length);

    // suffix the prefix with a space if it needs one
    if (prefixText.length > 0 && !prefixText.endsWith(' ')) {
      prefixText += ' ';
    }

    // prefix the suffix with a space if it needs one
    if (!suffixText.startsWith(' ')) {
      suffixText = ` ${suffixText}`;
    }

    text = `${prefixText}${text}${suffixText}`;
    element.value = text;
    element.dispatchEvent(new Event('input', {bubbles: true}));

    const instance = getReactInstance(element);
    if (instance) {
      const props = instance.memoizedProps;
      if (props && props.onChange) {
        props.onChange({target: element});
      }
    }

    if (shouldFocus) {
      element.focus();
    }

    const selectionEnd = selectionStart + text.length;
    element.setSelectionRange(selectionEnd, selectionEnd);
  }
}
