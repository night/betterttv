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

class SafeEmoteMenu extends React.Component {
  componentDidMount() {
    const {onMount} = this.props;
    onMount();
  }

  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  render() {
    const {appendToChat} = this.props;
    return <EmoteMenu appendText={appendToChat} />;
  }
}

class EmoteMenuModule {
  constructor() {
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.embedEmoteMenu());
    domObserver.on(CHAT_INPUT_ICONS_SELECTOR, () => this.embedEmoteMenu());
  }

  embedEmoteMenu() {
    const container = $(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const clickTwitchEmotes = settings.get(SettingIds.CLICK_TWITCH_EMOTES);

    if (!container.length && clickTwitchEmotes) {
      const panel = document.createElement('div');
      panel.setAttribute('id', 'bttvEmoteMenuContainer');
      panel.classList.add(styles.emoteMenuContainer);
      $(CHAT_INPUT_ICONS_SELECTOR).append(panel);
      ReactDOM.render(
        <SafeEmoteMenu onError={this.hide} onMount={this.show} appendToChat={this.appendToChat} />,
        panel
      );
    }

    if (container.length && !clickTwitchEmotes) {
      this.hide();
    }
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

  hide() {
    $(EMOTE_PICKER_BUTTON_SELECTOR).show();
    $(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR).hide();
  }

  show() {
    $(EMOTE_PICKER_BUTTON_SELECTOR).hide();
    $(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR).show();
  }
}

export default new EmoteMenuModule();
