import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {EmoteProviders, SettingIds} from '../../../constants.js';
import EmoteMenuButton from '../components/LegacyButton.jsx';
import domObserver from '../../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';

const CHAT_TEXT_AREA = 'div#input[contenteditable]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';
const CHAT_BUTTON_CONTAINER_SELECTOR = '#picker-buttons';
const NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR = '.yt-live-chat-icon-toggle-button-renderer';

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
    domObserver.on(CHAT_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadLegacyButton();
    });
    watcher.on('load.youtube', () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.loadLegacyButton());
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);

    // TODO: take into account emote menu setting in the future
    if (legacyContainer == null) {
      const nativeButtonContainer = document.querySelector(CHAT_BUTTON_CONTAINER_SELECTOR);
      if (nativeButtonContainer == null) {
        return;
      }
      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      nativeButtonContainer.insertBefore(buttonContainer, nativeButtonContainer.firstChild);

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
          boundingQuerySelector="#live-chat-message-input"
        />,
        buttonContainer
      );

      mountedNode = buttonContainer;
    }

    this.show(true);
  }

  show(visible) {
    // TODO: take into account emote menu setting in the future
    const nativeContainer = document.querySelector(NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR);
    if (nativeContainer != null) {
      nativeContainer.classList.toggle(styles.hideEmoteMenuButton, visible);
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    if (legacyContainer != null) {
      legacyContainer.classList.toggle(styles.hideEmoteMenuButton, !visible);
    }
  }

  appendToChat(emote, shouldFocus = true) {
    const element = document.querySelector(CHAT_TEXT_AREA);

    // selection state is lost when a user opens the emote menu, so we can only append
    const prefixText = element.textContent.toString();
    let prefixSuffixText =
      prefixText.length > 0 && !prefixText.endsWith(' ') && !prefixText.endsWith('\xa0') ? ' ' : '';
    const suffixPrefixHTML = '&nbsp;';

    let newNode;
    if (emote.category.provider === EmoteProviders.YOUTUBE) {
      newNode = document.createElement('img');
      newNode.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
      newNode.src = emote.images['1x'];
      newNode.alt = emote.code;
      newNode.setAttribute('data-emoji-id', emote.id);
    } else {
      newNode = document.createTextNode(`${prefixSuffixText}${emote.code}`);
      prefixSuffixText = '';
    }

    if (prefixSuffixText.length > 0) {
      element.appendChild(document.createTextNode(prefixSuffixText));
    }
    element.appendChild(newNode);
    element.innerHTML += suffixPrefixHTML;

    element.dispatchEvent(new Event('input', {bubbles: true}));

    if (shouldFocus) {
      const range = document.createRange();
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);

      const selection = document.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      element.focus();
    }
  }
}
