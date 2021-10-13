import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import EmoteMenuButton from '../components/LegacyButton.jsx';
import domObserver from '../../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getReactInstance} from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';

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
    } else if (document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR) != null) {
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

let mountedNode;

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadLegacyButton();
    });
    watcher.on('load.chat', () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.loadLegacyButton());
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const emoteMenuEnabled = settings.get(SettingIds.EMOTE_MENU);

    if (emoteMenuEnabled && legacyContainer == null) {
      const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
      if (container == null) {
        return;
      }
      const rightContainer = container.lastChild;
      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      rightContainer.insertBefore(buttonContainer, rightContainer.lastChild);

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <SafeEmoteMenuButton
          onError={() => this.show(false)}
          onMount={() => this.show(true)}
          onClick={() => togglePopover()}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
          className={styles.button}
          boundingQuerySelector={'textarea[data-a-target="chat-input"]'}
        />,
        buttonContainer
      );
      mountedNode = buttonContainer;
    }

    this.show(true);
  }

  show(visible) {
    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const emoteMenuEnabled = settings.get(SettingIds.EMOTE_MENU);

    if (legacyContainer == null) {
      return;
    }

    legacyContainer.classList.toggle(styles.hideEmoteMenuButton, !visible || !emoteMenuEnabled);
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
