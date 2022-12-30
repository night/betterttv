import $ from 'jquery';
import dayjs from 'dayjs';
import isSafeRegex from 'safe-regex2';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import html from '../../utils/html.js';
import cdn from '../../utils/cdn.js';
import {escapeRegExp} from '../../utils/regex.js';
import {computeKeywords, KeywordTypes} from '../../utils/keywords.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {getCurrentUser} from '../../utils/user.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

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

const pinnedHighlightTemplate = ({timestamp, from, message}) => `
  <div id="${PINNED_HIGHLIGHT_ID}">
    <span class="close">
      <svg class="svg-close" height="8px" version="1.1" viewBox="0 0 16 16" width="8px" x="0px" y="0px">
        <path clip-rule="evenodd" d="M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z" fill-rule="evenodd"></path>
      </svg>
    </span>
    <span class="time">${timestamp}</span>
    <span class="display-name">${html.escape(from)}</span>
    <span class="message">${html.escape(message)}</span>
  </div>
`;

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

function fieldContainsKeyword(keywords, from, field) {
  const currentUser = getCurrentUser();
  if (currentUser != null && currentUser.name === from) {
    return false;
  }

  for (let keyword of keywords) {
    const regexKeyword = extractRegex(keyword);
    if (regexKeyword != null) {
      return regexKeyword.test(field);
    }

    keyword = escapeRegExp(keyword);
    keyword = wildcard(keyword);
    keyword = exactMatch(keyword);

    if (keywordRegEx(keyword).test(field)) {
      return true;
    }
  }

  return false;
}

function isReply($message) {
  return $message.closest('.chat-input-tray__open').length > 0;
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

let $pinnedHighlightsContainer;

class ChatHighlightBlacklistKeywordsModule {
  constructor() {
    watcher.on('load', () => readRepairKeywords());
    watcher.on('load.chat', () => this.loadChat());
    watcher.on('load.vod', () => this.loadChat());
    watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));
    watcher.on('vod.message', ($message) => this.onVODMessage($message));
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

  onMessage($message, messageObj) {
    const {user, timestamp, messageParts, reply} = messageObj;
    if (user == null) {
      return;
    }

    const from = user.userLogin;
    const message = messageTextFromAST(messageParts);
    const date = new Date(timestamp);
    const badges = [...$message.find(CHAT_BADGE_SELECTOR)].map((badge) => badge.getAttribute('alt') || '');

    if (
      badges.some((value) => fieldContainsKeyword(blacklistBadges, from, value)) ||
      fieldContainsKeyword(blacklistUsers, from, from) ||
      fieldContainsKeyword(blacklistKeywords, from, message) ||
      (reply != null &&
        (fieldContainsKeyword(blacklistUsers, from, reply.parentUserLogin) ||
          fieldContainsKeyword(blacklistKeywords, from, reply.parentMessageBody)))
    ) {
      this.markBlacklisted($message);
      return;
    }

    if (
      badges.some((value) => fieldContainsKeyword(highlightBadges, from, value)) ||
      fieldContainsKeyword(highlightUsers, from, from) ||
      fieldContainsKeyword(highlightKeywords, from, message) ||
      (reply != null &&
        (fieldContainsKeyword(highlightUsers, from, reply.parentUserLogin) ||
          fieldContainsKeyword(highlightKeywords, from, reply.parentMessageBody)))
    ) {
      this.markHighlighted($message);

      if (isReply($message)) return;

      if (settings.get(SettingIds.HIGHLIGHT_FEEDBACK)) {
        this.handleHighlightSound();
      }

      if (timestamp > loadTime) {
        this.pinHighlight({from, message, date});
      }
    }
  }

  onVODMessage($message) {
    const $from = $message.find(VOD_CHAT_FROM_SELECTOR);
    const from = ($from.attr('href') || '').split('?')[0].split('/').pop();
    const $messageContent = $message.find(VOD_CHAT_MESSAGE_SELECTOR);
    const emotes = Array.from($messageContent.find(VOD_CHAT_MESSAGE_EMOTE_SELECTOR)).map((emote) =>
      emote.getAttribute('alt')
    );
    const messageContent = `${$messageContent.text().replace(/^:/, '')} ${emotes.join(' ')}`;
    const badges = [...$message.find(CHAT_BADGE_SELECTOR)].map((badge) => badge.getAttribute('alt') || '');

    if (
      badges.some((value) => fieldContainsKeyword(blacklistBadges, from, value)) ||
      fieldContainsKeyword(blacklistUsers, from, from) ||
      fieldContainsKeyword(blacklistKeywords, from, messageContent)
    ) {
      this.markBlacklisted($message);
      return;
    }

    if (
      badges.some((value) => fieldContainsKeyword(highlightBadges, from, value)) ||
      fieldContainsKeyword(highlightUsers, from, from) ||
      fieldContainsKeyword(highlightKeywords, from, messageContent)
    ) {
      this.markHighlighted($message);

      if (settings.get(SettingIds.HIGHLIGHT_FEEDBACK)) {
        this.handleHighlightSound();
      }

      this.pinHighlight({from, message: messageContent, date: new Date()});
    }
  }

  markHighlighted($message) {
    $message.addClass('bttv-highlighted');
  }

  markBlacklisted($message) {
    $message.attr('style', 'display: none !important;');
  }

  loadPinnedHighlights() {
    if (settings.get(SettingIds.PINNED_HIGHLIGHTS) === false || $(`#${PINNED_CONTAINER_ID}`).length) return;

    $pinnedHighlightsContainer = $(`<div id="${PINNED_CONTAINER_ID}" />`).appendTo($(CHAT_LIST_SELECTOR));
  }

  unloadPinnedHighlights() {
    if (!$pinnedHighlightsContainer) return false;
    $pinnedHighlightsContainer.remove();
    return true;
  }

  pinHighlight({from, message, date}) {
    if (settings.get(SettingIds.PINNED_HIGHLIGHTS) === false || !$pinnedHighlightsContainer) return;

    // we need to dynamically change the top of this card due to community highlight visibility
    const $communityHighlightsCard = $('.community-highlight-stack__card');
    if ($communityHighlightsCard.length > 0) {
      $pinnedHighlightsContainer.css('top', $communityHighlightsCard.outerHeight());
    } else {
      $pinnedHighlightsContainer.css('top', 0);
    }

    if ($pinnedHighlightsContainer.children().length + 1 > settings.get(SettingIds.MAX_PINNED_HIGHLIGHTS)) {
      $pinnedHighlightsContainer.children().first().remove();
    }

    const timestamp = dayjs(date).format('hh:mm');

    const $newHighlight = $(pinnedHighlightTemplate({timestamp, from, message}));

    $newHighlight.children('.close').on('click', () => $newHighlight.remove());

    $pinnedHighlightsContainer.append($newHighlight);

    if (settings.get(SettingIds.TIMEOUT_HIGHLIGHTS) === true) {
      setTimeout(() => $newHighlight.remove(), PINNED_HIGHLIGHT_TIMEOUT);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatHighlightBlacklistKeywordsModule()]);
