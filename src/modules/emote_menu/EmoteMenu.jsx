import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../settings.js';
import {SettingIds} from '../../constants.js';
import EmoteMenu from './components/Button.jsx';
import LegacyButton from './components/LegacyButton.jsx';
import domObserver from '../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getReactInstance} from '../../utils/twitch.js';
import {getCurrentUser} from '../../utils/user.js';

const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';
const CHAT_INPUT_ICONS_SELECTOR = '.chat-input__input-icons';
const BTTV_EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="bttv-emote-picker-button"]';
const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';
const CHAT_SETTINGS_BUTTON_SELECTOR = '.chat-input button[data-a-target="chat-settings"]';
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

class SafeEmoteMenu extends React.Component {
  componentDidMount() {
    const {onMount} = this.props;
    onMount();
  }

  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  static getDerivedStateFromError() {
    return null;
  }

  render() {
    return <EmoteMenu {...this.props} />;
  }
}

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_INPUT_ICONS_SELECTOR, () => this.load());
    domObserver.on(CHAT_SETTINGS_BUTTON_SELECTOR, () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => {
      this.load();
      this.loadLegacyButton();
    });
  }

  load() {
    if (getCurrentUser() == null) return;

    const container = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (container == null && clickTwitchEmotes) {
      const popover = document.createElement('div');
      popover.classList.add(styles.container);
      const chatInputIcons = document.querySelector(CHAT_INPUT_ICONS_SELECTOR);
      const buttonContainer = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR).parentElement.cloneNode(true);
      const button = buttonContainer.childNodes[0];
      button.setAttribute('data-a-target', 'bttv-emote-picker-button');
      button.addEventListener('click', () => togglePopover());

      chatInputIcons.appendChild(buttonContainer);
      chatInputIcons.appendChild(popover);

      ReactDOM.render(
        <SafeEmoteMenu
          onError={() => this.show(false)}
          onMount={this.show}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
        />,
        popover
      );
    }

    if (container != null) {
      this.show(clickTwitchEmotes);
    }
  }

  show(visible = true) {
    const bttvEmotePicker = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_SELECTOR);

    if (bttvEmotePicker != null) {
      bttvEmotePicker.classList.toggle(styles.hideEmoteMenuButton, !visible);
      const emotePicker = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);
      emotePicker.parentElement.classList.toggle(styles.hideDefaultEmoteMenuButton, visible);
    }
  }

  appendToChat(text, shouldFocus = true) {
    const element = document.querySelector(CHAT_TEXT_AREA);

    let selectionEnd = element.selectionStart + text.length;
    const currentValue = element.value;
    const prefixText = currentValue.substring(0, element.selectionStart);
    let suffixText = currentValue.substring(element.selectionEnd, currentValue.length - 1);

    if (suffixText.length === 0) {
      suffixText = ' ';
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
    selectionEnd = element.selectionStart + text.length;
    element.setSelectionRange(selectionEnd, selectionEnd);
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) return;

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (clickTwitchEmotes && legacyContainer == null) {
      const container = document
        .querySelector(CHAT_SETTINGS_BUTTON_SELECTOR)
        .closest(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR).lastChild;

      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      container.insertBefore(buttonContainer, container.lastChild);

      ReactDOM.render(<LegacyButton />, buttonContainer);
    }

    if (legacyContainer != null) {
      legacyContainer.classList.toggle(styles.hideEmoteMenuButton, !clickTwitchEmotes);
    }
  }
}
