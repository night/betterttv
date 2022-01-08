import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import EmoteMenuButton from '../components/LegacyButton.jsx';
import domObserver from '../../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import twitch from '../../../utils/twitch.js';

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';

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
          appendToChat={this.appendToChat}
          className={styles.button}
          boundingQuerySelector={CHAT_TEXT_AREA}
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
    let prefixText = twitch.getChatInputValue();

    // suffix the prefix with a space if it needs one
    if (prefixText.length > 0 && !prefixText.endsWith(' ')) {
      prefixText += ' ';
    }

    twitch.setChatInputValue(`${prefixText}${text} `, shouldFocus);
  }
}
