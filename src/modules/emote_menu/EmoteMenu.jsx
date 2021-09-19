import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../settings.js';
import {SettingIds} from '../../constants.js';
import EmoteMenuButton from './components/LegacyButton.jsx';
import domObserver from '../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getReactInstance} from '../../utils/twitch.js';
import {getCurrentUser} from '../../utils/user.js';

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

class SafeEmoteMenuButton extends React.Component {
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
    return <EmoteMenuButton {...this.props} />;
  }
}

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR, () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.loadLegacyButton());
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) return;

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (clickTwitchEmotes && legacyContainer == null) {
      const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR).lastChild;

      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      container.insertBefore(buttonContainer, container.lastChild);

      ReactDOM.render(
        <SafeEmoteMenuButton
          onError={() => this.show(false)}
          onMount={() => this.show(true)}
          onClick={() => togglePopover()}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
        />,
        buttonContainer
      );
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
}
