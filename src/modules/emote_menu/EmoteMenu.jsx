import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../settings.js';
import {SettingIds} from '../../constants.js';
import EmoteMenu from './components/Button.jsx';
import domObserver from '../../observers/dom.js';
import styles from './style.module.css';
import {getReactInstance} from '../../utils/twitch.js';

const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';
const CHAT_INPUT_ICONS_SELECTOR = '.chat-input__input-icons';
const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR = '#bttvEmoteMenuContainer';
const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

function clickCallback(e) {
  e.stopImmediatePropagation();
  handleOpen();
}

class SafeEmoteMenu extends React.Component {
  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  render() {
    return <EmoteMenu {...this.props} />;
  }
}

class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_INPUT_ICONS_SELECTOR, () => this.embedEmoteMenu());
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.embedEmoteMenu());
  }

  embedEmoteMenu() {
    if (settings.get(SettingIds.CLICK_TWITCH_EMOTES)) {
      this.load();
      return;
    }

    this.unload();
  }

  load() {
    const container = $(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    $(EMOTE_PICKER_BUTTON_SELECTOR).on('click', clickCallback);

    if (!container.length) {
      const panel = document.createElement('div');
      panel.setAttribute('id', 'bttvEmoteMenuContainer');
      panel.classList.add(styles.emoteMenuContainer);
      $(CHAT_INPUT_ICONS_SELECTOR).append(panel);
      ReactDOM.render(
        <SafeEmoteMenu onError={this.unload} appendToChat={this.appendToChat} setHandleOpen={setHandleOpen} />,
        panel
      );
    }
  }

  unload() {
    $(EMOTE_PICKER_BUTTON_SELECTOR).off('click', clickCallback);
  }

  appendToChat(text) {
    const element = $(CHAT_TEXT_AREA).get(0);

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

export default new EmoteMenuModule();
