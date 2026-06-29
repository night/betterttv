import {off, on} from 'delegated-events';
import React from 'react';
import {PlatformTypes} from '@/constants';
import {bindTooltip} from '@/modules/tooltip/index';
import storage from '@/storage';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';
import MentionHintTooltip from './MentionHintTooltip';

const CHAT_ROOM_SELECTOR = '.chat-list,.chat-list--default,.chat-list--other';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const USERNAME_SELECTORS =
  '.chat-line__message span.chat-author__display-name, .chat-line__message span[data-a-target="chat-message-mention"]';
const CHAT_LINE_USERNAME_SELECTOR = '.chat-author__display-name';

// Hide the hint for good once the user has used the double-click gesture.
const MENTION_USED_STORAGE_KEY = 'doubleClickMentionUsed';

let hasUsedMention = storage.get(MENTION_USED_STORAGE_KEY) ?? false;

function recordMentionUsage() {
  if (hasUsedMention) {
    return;
  }

  hasUsedMention = true;
  storage.set(MENTION_USED_STORAGE_KEY, true);
}

function clearSelection() {
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
}

function handleDoubleClick(e) {
  if (e.shiftKey || e.ctrlKey) return;

  document.querySelector('button[data-test-selector="close-viewer-card"]')?.click();

  clearSelection();
  let user = e.target.innerText ? e.target.innerText.replace('@', '') : '';
  const messageObj = twitch.getChatMessageObject(e.target.closest(CHAT_LINE_SELECTOR));
  if (messageObj != null && e.target.getAttribute('data-a-target') !== 'chat-message-mention') {
    if (messageObj.user.userDisplayName?.toLowerCase() === messageObj.user.userLogin) {
      user = messageObj.user.userDisplayName;
    } else {
      user = messageObj.user.userLogin;
    }
  }
  const chatInputValue = twitch.getChatInputValue();
  if (chatInputValue == null) return;
  const input = chatInputValue.trim();
  const output = input ? `${input} @${user} ` : `@${user}, `;
  twitch.setChatInputValue(output, true);

  recordMentionUsage();
}

class DoubleClickMentionModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    watcher.on('chat.message', (element) => this.bindUsernameTooltip(element));
  }

  bindUsernameTooltip(element) {
    if (hasUsedMention) {
      return;
    }

    const usernameElement = element.querySelector(CHAT_LINE_USERNAME_SELECTOR);
    if (usernameElement == null) {
      return;
    }

    bindTooltip(usernameElement, {content: <MentionHintTooltip />});
  }

  load() {
    const chatRoom = document.querySelector(CHAT_ROOM_SELECTOR);
    if (chatRoom == null) {
      return;
    }

    off('dblclick', USERNAME_SELECTORS, handleDoubleClick);
    on('dblclick', USERNAME_SELECTORS, handleDoubleClick);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DoubleClickMentionModule()]);
