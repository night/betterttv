import React from 'react';
import {off, on} from 'delegated-events';
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

// Hide the hint once the gesture is used, but bring it back after a week of no
// usage so it isn't forgotten. The timestamp is the only state we need: a never-used
// value of 0 reads as older than a week, so it shows by default.
const MENTION_LAST_USED_STORAGE_KEY = 'doubleClickMentionLastUsedAt';
const MENTION_HINT_RESET_DELAY = 7 * 24 * 60 * 60 * 1000;

let mentionLastUsedAt = storage.get(MENTION_LAST_USED_STORAGE_KEY) ?? 0;

function recordMentionUsage() {
  // Renew the timestamp on every use so the hint only returns after a full week of inactivity.
  mentionLastUsedAt = Date.now();
  storage.set(MENTION_LAST_USED_STORAGE_KEY, mentionLastUsedAt);
}

function shouldShowMentionHint() {
  return Date.now() - mentionLastUsedAt >= MENTION_HINT_RESET_DELAY;
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
    if (!shouldShowMentionHint()) {
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
