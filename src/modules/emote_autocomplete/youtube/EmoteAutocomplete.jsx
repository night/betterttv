import React from 'react';
import ReactDOM from 'react-dom';
import EmoteWhisper from '../components/EmoteWhisper.jsx';
import styles from './EmoteAutocomplete.module.css';

let mountedNode;

const CHAT_TEXT_AREA = 'div#input[contenteditable]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';
const YOUTUBE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'yt-live-chat-text-input-field-renderer #dropdown';

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    this.unloadNativeAutocomplete();
  }

  load() {
    const emoteAutcompleteContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);

    // TODO: update when we merge settings menu for youtube
    if (emoteAutcompleteContainer == null) {
      const element = document.querySelector(CHAT_TEXT_AREA);
      const whisperContainer = document.createElement('div');
      whisperContainer.setAttribute('data-a-target', 'bttv-autocomplete-matches-container');
      const chatApp = document.querySelector('#chat');

      if (chatApp != null) {
        chatApp.appendChild(whisperContainer);
      }

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <EmoteWhisper
          boundingQuerySelector={CHAT_TEXT_AREA}
          chatInputElement={element}
          autocomplete={this.autocomplete}
        />,
        whisperContainer
      );

      mountedNode = whisperContainer;
    }

    this.show();
  }

  autocomplete(emote) {
    console.log(emote);
  }

  unloadNativeAutocomplete() {
    const dropdown = document.querySelector(YOUTUBE_AUTOCOMPLETE_CONTAINER_SELECTOR);

    // TODO: update when we merge settings menu for youtube
    if (dropdown != null) {
      dropdown.classList.toggle(styles.hideNativeAutocomplete, true);
    }
  }
}
