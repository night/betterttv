import React from 'react';
import Autocomplete from '../../../common/components/Autocomplete.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import {EmoteProviders, SettingIds, ShadowDOMComponentIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import {createYoutubeEmojiNode} from '../../../utils/youtube.js';
import shadowDom from '../../shadow_dom/index.js';
import EmoteRow from '../components/EmoteRow.jsx';
import styles from './EmoteAutocomplete.module.css';

const CHAT_TEXT_AREA = '#input-container';

let removeDirtyListener = null;

function findFocusedWord(value, selectionStart = 0) {
  const subString = value.substring(0, selectionStart);
  const focusedWords = subString.split(/\s+/);
  const focusedWord = focusedWords[focusedWords.length - 1];

  return {
    value: focusedWord,
    start: subString.length - focusedWord.length,
    end: selectionStart,
  };
}

function getChatInputPartialEmote() {
  const {anchorNode, anchorOffset} = document.getSelection();
  if (anchorNode?.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const {value} = findFocusedWord(anchorNode.data, anchorOffset);
  if (value == null || !/^(:(.*[a-zA-Z0-9]){2,})/.test(value) || value.endsWith(':')) {
    return null;
  }

  return value;
}

function toggleNativeAutocomplete(partialInput) {
  const nativeAutocomplete = document.querySelector('yt-live-chat-text-input-field-renderer > tp-yt-iron-dropdown');

  if (nativeAutocomplete == null) {
    return;
  }

  nativeAutocomplete.classList.toggle(styles.hideNativeAutocomplete, partialInput != null);
}

function computeItems(partialInput) {
  return emoteMenuViewStore.search(partialInput, false);
}

function getItemKey(item) {
  return item.id;
}

function handleDirty() {
  emoteMenuViewStore.updateEmotes();
}

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    domObserver.on(CHAT_TEXT_AREA, () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    const emoteAutocompleteEnabled = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (!emoteAutocompleteEnabled) {
      shadowDom.unmount(ShadowDOMComponentIds.EMOTE_AUTOCOMPLETE);
      removeDirtyListener?.();
      removeDirtyListener = null;

      return;
    }

    if (removeDirtyListener == null) {
      handleDirty();
      removeDirtyListener = emoteMenuViewStore.on('dirty', handleDirty);
    }

    if (shadowDom.isMounted(ShadowDOMComponentIds.EMOTE_AUTOCOMPLETE)) {
      return;
    }

    shadowDom.mount(
      ShadowDOMComponentIds.EMOTE_AUTOCOMPLETE,
      <Autocomplete
        chatInputQuerySelector={CHAT_TEXT_AREA}
        getChatInputPartialInput={this.getChatInputPartialEmote}
        computeItems={computeItems}
        getItemKey={getItemKey}
        onComplete={this.replaceChatInputPartialEmote}
        renderRow={(props) => <EmoteRow {...props} />}
      />
    );
  }

  replaceChatInputPartialEmote(emote) {
    const {anchorNode, anchorOffset} = document.getSelection();

    if (anchorNode?.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const {data} = anchorNode;
    const {start, end} = findFocusedWord(data, anchorOffset);

    const prefix = data.substring(0, start);
    const suffix = data.substring(end, data.length);

    const range = document.createRange();
    if (emote.category.provider === EmoteProviders.YOUTUBE) {
      const node = createYoutubeEmojiNode(emote);
      anchorNode.replaceWith(node);

      if (prefix.length > 0) {
        const textNode = document.createTextNode(prefix);
        node.parentElement.insertBefore(textNode, node);
      }

      if (suffix.length > 0) {
        const textNode = document.createTextNode(suffix);
        node.parentElement.insertBefore(textNode, node.nextSibling);
      }

      range.setStartAfter(node);
      range.setEndAfter(node);
    } else {
      anchorNode.textContent = `${prefix}${emote.code}${suffix}`;
      const endSelection = prefix.length + emote.code.length;

      range.setEnd(anchorNode, endSelection);
      range.setStart(anchorNode, endSelection);
    }

    const element = document.querySelector(CHAT_TEXT_AREA);
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.focus();

    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getChatInputPartialEmote() {
    const partialInput = getChatInputPartialEmote();
    toggleNativeAutocomplete(partialInput);
    return partialInput;
  }
}
