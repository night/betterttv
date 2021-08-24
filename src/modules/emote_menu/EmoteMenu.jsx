import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../settings.js';
import {SettingIds} from '../../constants.js';
import EmoteMenu from './components/Button.jsx';
import domObserver from '../../observers/dom.js';
import styles from './style.module.css';
import twitch, {getReactInstance} from '../../utils/twitch.js';

const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';
const CHAT_INPUT_ICONS_SELECTOR = '.chat-input__input-icons';
const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR = 'button[data-a-target="bttv-emote-picker-button"]';
const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"]';

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
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.load());
  }

  load() {
    if (twitch.getCurrentUser() == null) return;

    const container = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (container == null && clickTwitchEmotes) {
      const popover = document.createElement('div');
      popover.classList.add(styles.emoteMenuContainer);
      const chatInputIcons = document.querySelector(CHAT_INPUT_ICONS_SELECTOR);
      const buttonContainer = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR).parentElement.cloneNode(true);
      const button = buttonContainer.childNodes[0];
      button.setAttribute('data-a-target', 'bttv-emote-picker-button');
      button.addEventListener('click', () => togglePopover());

      chatInputIcons.appendChild(buttonContainer);
      chatInputIcons.appendChild(popover);

      ReactDOM.render(
        <SafeEmoteMenu
          onError={this.hide}
          onMount={this.show}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
        />,
        popover
      );
    }

    if (container != null) {
      if (clickTwitchEmotes) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  hide() {
    const bttvEmotePicker = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const emotePicker = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);

    emotePicker.style.display = 'inline-flex';
    bttvEmotePicker.style.display = 'none';
  }

  show() {
    const bttvEmotePicker = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);

    if (bttvEmotePicker != null) {
      bttvEmotePicker.style.display = 'inline-flex';
      const emotePicker = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);
      emotePicker.style.display = 'none';
    }
  }

  appendToChat(text) {
    const element = document.querySelector(CHAT_TEXT_AREA);

    let selectionEnd = element.selectionStart + text.length;
    const currentValue = element.value;
    const beforeText = currentValue.substring(0, element.selectionStart);
    const afterText = currentValue.substring(element.selectionEnd, currentValue.length);

    if (beforeText !== '' && beforeText.substr(-1) !== ' ') {
      text = ` ${text}`;
    }

    text = `${beforeText + text} ${afterText}`;
    element.value = text;
    element.dispatchEvent(new Event('input', {bubbles: true}));

    const instance = getReactInstance(element);
    if (instance) {
      const props = instance.memoizedProps;
      if (props && props.onChange) {
        props.onChange({target: element});
      }
    }

    element.focus();
    selectionEnd = element.selectionStart + text.length;
    element.setSelectionRange(selectionEnd, selectionEnd);
  }
}
