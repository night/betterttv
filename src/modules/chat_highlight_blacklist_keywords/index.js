import {DateTime} from 'luxon';
import isSafeRegex from 'safe-regex2';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import cdn from '../../utils/cdn.js';
import colors from '../../utils/colors.js';
import {escapeRegExp} from '../../utils/regex.js';
import {computeKeywords, KeywordTypes} from '../../utils/keywords.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {getCurrentUser} from '../../utils/user.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {getCurrentChannel} from '../../utils/channel.js';

const CHAT_LIST_SELECTOR =
  '.chat-list .chat-scrollable-area__message-container,.chat-list--default .chat-scrollable-area__message-container,.chat-list--other .chat-scrollable-area__message-container,.video-chat div[data-test-selector="video-chat-message-list-wrapper"]';
const CHAT_BADGE_SELECTOR = '.chat-badge';
const VOD_CHAT_FROM_SELECTOR = '.video-chat__message-author';
const VOD_CHAT_MESSAGE_SELECTOR = 'div[data-test-selector="comment-message-selector"]';
const VOD_CHAT_MESSAGE_EMOTE_SELECTOR = '.chat-line__message--emote';
const PINNED_HIGHLIGHT_ID = 'bttv-pinned-highlight';
const PINNED_CONTAINER_ID = 'bttv-pin-container';
const PINNED_HIGHLIGHT_TIMEOUT = 60 * 1000;
const REGEX_KEYWORD_REGEX = /^~\/(.*)\/([a-z]+)?$/;

function createPinnedHighlight({timestamp, from, message: messageText}) {
  const container = document.createElement('div');
  container.id = PINNED_HIGHLIGHT_ID;

  const closeButton = document.createElement('span');
  closeButton.classList.add('close');
  closeButton.addEventListener('click', () => container.remove());
  container.appendChild(closeButton);

  const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  closeIcon.classList.add('svg-close');
  closeIcon.setAttribute('height', '8px');
  closeIcon.setAttribute('width', '8px');
  closeIcon.setAttribute('viewBox', '0 0 16 16');
  closeIcon.setAttribute('x', '0px');
  closeIcon.setAttribute('y', '0px');
  closeButton.appendChild(closeIcon);

  const closeIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  closeIconPath.setAttribute('clip-rule', 'evenodd');
  closeIconPath.setAttribute('fill-rule', 'evenodd');
  closeIconPath.setAttribute(
    'd',
    'M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z'
  );
  closeIcon.appendChild(closeIconPath);

  const time = document.createElement('span');
  time.classList.add('time');
  time.innerText = timestamp;
  container.appendChild(time);

  const displayName = document.createElement('span');
  displayName.classList.add('display-name');
  displayName.innerText = from;
  container.appendChild(displayName);

  const message = document.createElement('span');
  message.classList.add('message');
  message.innerText = messageText;
  container.appendChild(message);

  return container;
}

let loadTime = 0;
let blacklistKeywords = [];
let blacklistUsers = [];
let blacklistBadges = [];
function computeBlacklistKeywords() {
  const keywords = settings.get(SettingIds.BLACKLIST_KEYWORDS);
  const {computedKeywords, computedUsers, computedBadges} = computeKeywords(keywords);
  blacklistKeywords = computedKeywords;
  blacklistUsers = computedUsers;
  blacklistBadges = computedBadges;
}

let highlightKeywords = [];
let highlightUsers = [];
let highlightBadges = [];
function computeHighlightKeywords() {
  const keywords = settings.get(SettingIds.HIGHLIGHT_KEYWORDS) || {};
  const {computedKeywords, computedUsers, computedBadges} = computeKeywords(keywords);
  highlightKeywords = computedKeywords;
  highlightUsers = computedUsers;
  highlightBadges = computedBadges;
}

function readRepairKeywords() {
  const highlightKeywordsValue = settings.get(SettingIds.HIGHLIGHT_KEYWORDS);
  const blacklistKeywordsValue = settings.get(SettingIds.BLACKLIST_KEYWORDS);

  for (const keywordsValue of [highlightKeywordsValue, blacklistKeywordsValue]) {
    if (keywordsValue == null) {
      continue;
    }

    let updated = false;
    const keysToPrune = [];

    for (const value of Object.values(keywordsValue)) {
      if (value.keyword == null || value.keyword.trim().length === 0) {
        keysToPrune.push(value.id);
        continue;
      }
      if (![KeywordTypes.EXACT, KeywordTypes.WILDCARD].includes(value.type)) {
        continue;
      }

      if (value.type === KeywordTypes.EXACT) {
        value.keyword = `<${value.keyword}>`;
      }
      value.type = KeywordTypes.MESSAGE;
      updated = true;
    }

    for (const key of keysToPrune) {
      delete keywordsValue[key];
      updated = true;
    }

    if (updated) {
      settings.set(
        keywordsValue === highlightKeywordsValue ? SettingIds.HIGHLIGHT_KEYWORDS : SettingIds.BLACKLIST_KEYWORDS,
        keywordsValue
      );
    }
  }

  const user = getCurrentUser();
  if (highlightKeywordsValue == null && user != null) {
    settings.set(SettingIds.HIGHLIGHT_KEYWORDS, {
      0: {
        id: 0,
        type: KeywordTypes.MESSAGE,
        status: null,
        keyword: user.name,
      },
    });
  }
}

function wildcard(keyword) {
  return keyword.replace(/\*/g, '[^ ]*');
}

function exactMatch(keyword) {
  return keyword.replace(/^<(.*)>$/g, '^$1$$');
}

function extractRegex(keyword) {
  const matches = REGEX_KEYWORD_REGEX.exec(keyword);
  if (matches == null || !isSafeRegex(matches[1])) {
    return null;
  }

  try {
    return new RegExp(matches[1], matches[2]);
  } catch (_) {}

  return null;
}

function keywordRegEx(keyword) {
  return new RegExp(`(\\s|^|@)${keyword}([!.,:';?/]|\\s|$)`, 'i');
}

function fieldContainsKeyword(keywords, from, field, onColorChange) {
  const currentUser = getCurrentUser();
  // onColorChange here is used to detect highlighting
  if (currentUser != null && currentUser.name === from && onColorChange == null) {
    return false;
  }

  const channel = getCurrentChannel();

  for (const {keyword, channels, color} of keywords) {
    if (
      channels != null &&
      channels.length > 0 &&
      channel != null &&
      !channels.map((_channel) => _channel.toLowerCase()).includes(channel.name)
    ) {
      continue;
    }

    const regexKeyword = extractRegex(keyword);
    if (regexKeyword != null) {
      if (!regexKeyword.test(field)) {
        continue;
      }
    } else {
      let mutatedKeyword = escapeRegExp(keyword);
      mutatedKeyword = wildcard(mutatedKeyword);
      mutatedKeyword = exactMatch(mutatedKeyword);

      if (!keywordRegEx(mutatedKeyword).test(field)) {
        continue;
      }
    }

    if (color != null && onColorChange != null) {
      onColorChange(color);
    }

    return true;
  }

  return false;
}

function isReply(message) {
  return message.closest('.chat-input-tray__open') != null;
}

function messageTextFromAST(ast) {
  return ast
    .map((node) => {
      switch (node.type) {
        case 0: // Text
          return node.content.trim();
        case 3: // CurrentUserHighlight
          return `@${node.content}`;
        case 4: // Mention
          return `@${node.content.recipient}`;
        case 5: // Link
          return node.content.url;
        case 6: // Emote
          return node.content.alt;
        default:
          return '';
      }
    })
    .join(' ');
}

let pinnedHighlightsContainer;

class ChatHighlightBlacklistKeywordsModule {
  constructor() {
    watcher.on('load', () => readRepairKeywords());
    watcher.on('load.chat', () => this.loadChat());
    watcher.on('load.vod', () => this.loadChat());
    watcher.on('chat.message', (message, messageObj) => this.onMessage(message, messageObj, false));
    watcher.on('chat.notice_message', (message, messageObj) => this.onMessage(message, messageObj, true));
    watcher.on('vod.message', (message) => this.onVODMessage(message));
    settings.on(`changed.${SettingIds.BLACKLIST_KEYWORDS}`, computeBlacklistKeywords);
    settings.on(`changed.${SettingIds.HIGHLIGHT_KEYWORDS}`, computeHighlightKeywords);
    settings.on(`changed.${SettingIds.PINNED_HIGHLIGHTS}`, (value) =>
      value === true ? this.loadPinnedHighlights() : this.unloadPinnedHighlights()
    );

    this.sound = null;
    this.handleHighlightSound = this.handleHighlightSound.bind(this);
  }

  handleHighlightSound() {
    if (!this.sound) {
      this.sound = new Audio(cdn.url('assets/sounds/ts-tink.ogg'));
    }
    this.sound.pause();
    this.sound.currentTime = 0;
    this.sound.play();
  }

  loadChat() {
    readRepairKeywords();
    computeBlacklistKeywords();
    computeHighlightKeywords();
    this.loadPinnedHighlights();
    loadTime = Date.now();
  }

  onMessage(message, messageObj, notice) {
    const {user, login, timestamp, messageParts, reply} = messageObj;
    if (user == null && login == null) {
      return;
    }

    const from = login ?? user.userLogin;
    const messageText = notice ? message.textContent : messageTextFromAST(messageParts);
    const date = new Date(timestamp);
    const badges = [...message.querySelectorAll(CHAT_BADGE_SELECTOR)].map((badge) => badge.getAttribute('alt') || '');

    let color;
    function handleColorChange(newColor) {
      color = newColor;
    }

    if (
      badges.some((value) => fieldContainsKeyword(blacklistBadges, from, value)) ||
      fieldContainsKeyword(blacklistUsers, from, from) ||
      fieldContainsKeyword(blacklistKeywords, from, messageText) ||
      (reply != null &&
        (fieldContainsKeyword(blacklistUsers, from, reply.parentUserLogin) ||
          fieldContainsKeyword(blacklistKeywords, from, reply.parentMessageBody)))
    ) {
      this.markBlacklisted(message);
      return;
    }

    if (
      badges.some((value) => fieldContainsKeyword(highlightBadges, from, value, handleColorChange)) ||
      fieldContainsKeyword(highlightUsers, from, from, handleColorChange) ||
      fieldContainsKeyword(highlightKeywords, from, messageText, handleColorChange) ||
      (reply != null &&
        (fieldContainsKeyword(highlightUsers, from, reply.parentUserLogin, handleColorChange) ||
          fieldContainsKeyword(highlightKeywords, from, reply.parentMessageBody, handleColorChange)))
    ) {
      this.markHighlighted(message, color);

      if (isReply(message)) return;

      if (settings.get(SettingIds.HIGHLIGHT_FEEDBACK)) {
        this.handleHighlightSound();
      }

      if (timestamp > loadTime) {
        this.pinHighlight({from, message: messageText, date});
      }
    }
  }

  onVODMessage(message) {
    const fromElement = message.querySelector(VOD_CHAT_FROM_SELECTOR);
    const from = (fromElement?.getAttribute('href') || '').split('?')[0].split('/').pop();
    const messageContainer = message.querySelector(VOD_CHAT_MESSAGE_SELECTOR);
    const emotes = Array.from(messageContainer.querySelectorAll(VOD_CHAT_MESSAGE_EMOTE_SELECTOR)).map((emote) =>
      emote.getAttribute('alt')
    );
    const messageContent = `${messageContainer.textContent.replace(/^:/, '')} ${emotes.join(' ')}`;
    const badges = [...message.querySelectorAll(CHAT_BADGE_SELECTOR)].map((badge) => badge.getAttribute('alt') || '');

    let color;
    function handleColorChange(newColor) {
      color = newColor;
    }

    if (
      badges.some((value) => fieldContainsKeyword(blacklistBadges, from, value)) ||
      fieldContainsKeyword(blacklistUsers, from, from) ||
      fieldContainsKeyword(blacklistKeywords, from, messageContent)
    ) {
      this.markBlacklisted(message);
      return;
    }

    if (
      badges.some((value) => fieldContainsKeyword(highlightBadges, from, value, handleColorChange)) ||
      fieldContainsKeyword(highlightUsers, from, from, handleColorChange) ||
      fieldContainsKeyword(highlightKeywords, from, messageContent, handleColorChange)
    ) {
      this.markHighlighted(message, color);

      if (settings.get(SettingIds.HIGHLIGHT_FEEDBACK)) {
        this.handleHighlightSound();
      }

      this.pinHighlight({from, message: messageContent, date: new Date()});
    }
  }

  markHighlighted(message, color = undefined) {
    message.classList.add('bttv-highlighted');

    if (color == null) {
      color = '#ff0000';
    }

    const {r, g, b} = colors.getRgb(color);
    message.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
  }

  markBlacklisted(message) {
    message.style.display = 'none';
  }

  loadPinnedHighlights() {
    if (
      settings.get(SettingIds.PINNED_HIGHLIGHTS) === false ||
      document.querySelector(`#${PINNED_CONTAINER_ID}`) != null
    )
      return;

    pinnedHighlightsContainer = document.createElement('div');
    pinnedHighlightsContainer.id = PINNED_CONTAINER_ID;
    document.querySelector(CHAT_LIST_SELECTOR)?.appendChild(pinnedHighlightsContainer);
  }

  unloadPinnedHighlights() {
    if (!pinnedHighlightsContainer) return false;
    pinnedHighlightsContainer.remove();
    return true;
  }

  pinHighlight({from, message, date}) {
    if (settings.get(SettingIds.PINNED_HIGHLIGHTS) === false || pinnedHighlightsContainer == null) return;

    // we need to dynamically change the top of this card due to community highlight visibility
    const communityHighlightsCard = document.querySelector('.community-highlight-stack__card');
    if (communityHighlightsCard != null) {
      pinnedHighlightsContainer.style.top = `${communityHighlightsCard.offsetHeight}px`;
    } else {
      pinnedHighlightsContainer.style.top = 0;
    }

    if (pinnedHighlightsContainer.childNodes.length + 1 > settings.get(SettingIds.MAX_PINNED_HIGHLIGHTS)) {
      pinnedHighlightsContainer.firstChild.remove();
    }

    const timestamp = DateTime.fromJSDate(new Date(date)).toFormat('hh:mm');

    const newHighlight = createPinnedHighlight({timestamp, from, message});
    pinnedHighlightsContainer.appendChild(newHighlight);

    if (settings.get(SettingIds.TIMEOUT_HIGHLIGHTS) === true) {
      setTimeout(() => newHighlight.remove(), PINNED_HIGHLIGHT_TIMEOUT);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatHighlightBlacklistKeywordsModule()]);
