import React from 'react';
import ReactDOM from 'react-dom';
import {getCurrentUser} from '../../../utils/user.js';
import EmoteWhisper from '../components/EmoteWhisper.jsx';
import domObserver from '../../../observers/dom.js';

let mountedNode;

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';
const TWITCH_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-test-selector="autocomplete-matches-container"]';

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    this.unloadTwitchAutocomplete();
  }

  load() {
    if (getCurrentUser() == null) {
      return;
    }

    const element = document.querySelector(CHAT_TEXT_AREA);
    const emoteAutcompletContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);

    if (emoteAutcompletContainer == null) {
      const whisperContainer = document.createElement('div');
      whisperContainer.setAttribute('data-a-target', 'bttv-autocomplete-matches-container');
      document.body.appendChild(whisperContainer);

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <EmoteWhisper boundingQuerySelector={CHAT_TEXT_AREA} chatInputElement={element} />,
        whisperContainer
      );

      mountedNode = whisperContainer;
    }
  }

  unloadTwitchAutocomplete() {
    domObserver.on(TWITCH_AUTOCOMPLETE_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      node.remove();
    });
  }
}
