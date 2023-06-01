import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch, {SelectionTypes} from '../../utils/twitch.js';
import keyCodes from '../../utils/keycodes.js';
import emotes from '../emotes/index.js';
import {ChatFlags, PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {hasFlag} from '../../utils/flags.js';

const CHAT_INPUT_SELECTOR = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const AUTOCOMPLETE_SUGGESTIONS_SELECTOR = 'div[data-a-target="autocomplete-balloon"]';

function normalizedStartsWith(word, prefix) {
  return word && word.toLowerCase().startsWith(prefix);
}

class ChatTabcompletionModule {
  constructor() {
    watcher.on('chat.message', (el, messageObj) => this.storeUser(messageObj));
    watcher.on('load.chat', () => this.resetChannelData());
    this.load();
  }

  load() {
    this.tabTries = -1;
    this.suggestions = null;
    this.textSplit = ['', '', ''];
    this.userList = new Set();
    this.messageHistory = [];
    this.historyPos = -1;
  }

  storeUser({user: messageUser}) {
    if (messageUser == null) {
      return;
    }
    const {userDisplayName, userLogin} = messageUser;
    const user = userDisplayName && userDisplayName.toLowerCase() === userLogin ? userDisplayName : userLogin;
    this.userList.add(user);
  }

  onSendMessage({message}) {
    if (message.trim().length === 0) return;
    this.messageHistory.unshift(message);
    this.historyPos = -1;
  }

  resetChannelData() {
    this.userList = new Set();
    const chatInputSelector = document.querySelector(CHAT_INPUT_SELECTOR);
    if (chatInputSelector == null) {
      return;
    }

    chatInputSelector.removeEventListener('keydown', this.onKeydown);
    chatInputSelector.removeEventListener('focus', this.onFocus);
    chatInputSelector.addEventListener('keydown', this.onKeydown);
    chatInputSelector.addEventListener('focus', this.onFocus);
  }

  onFocus = () => {
    this.tabTries = -1;
  };

  onKeydown = (e, includeUsers = true) => {
    const keyCode = e.key;
    if (e.ctrlKey) return;

    const chatInputValue = twitch.getChatInputValue();
    if (keyCode === keyCodes.Tab && chatInputValue.length > 0) {
      e.preventDefault();

      // First time pressing tab, split before and after the word
      if (this.tabTries === -1) {
        const caretPos = chatInputValue.length;
        const text = chatInputValue;

        const start = (/[:()\w]+$/.exec(text.slice(0, caretPos)) || {index: caretPos}).index;
        const end = caretPos + (/^\w+/.exec(text.slice(caretPos)) || [''])[0].length;
        this.textSplit = [text.substring(0, start), text.substring(start, end), text.substring(end + 1)];

        // If there are no words in front of the caret, exit
        if (this.textSplit[1] === '') return;

        // Get all matching completions
        const includeEmotes = this.textSplit[0].slice(-1) !== '@';
        this.suggestions = this.getSuggestions(this.textSplit[1], includeUsers, includeEmotes);
      }

      if (settings.get(SettingIds.TAB_COMPLETION_TOOLTIP) && this.textSplit[0].slice(-1) === '@') {
        return;
      }

      if (this.suggestions.length > 0) {
        this.tabTries += e.shiftKey ? -1 : 1; // shift key iterates backwards
        if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
        if (this.tabTries < 0) this.tabTries = this.suggestions.length - 1;
        if (!this.suggestions[this.tabTries]) return;

        if (this.textSplit[2].trim() === '') {
          this.textSplit[2] = ' ';
        }

        // prevent twitch's tab completion from preventing text replacement
        e.stopImmediatePropagation();

        twitch.setChatInputValue(this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
      }
    } else if (keyCode === keyCodes.Escape && this.tabTries >= 0) {
      twitch.setChatInputValue(this.textSplit.join(''));
    } else if (keyCode !== keyCodes.Shift) {
      this.tabTries = -1;
    }

    // Message history
    if (hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_MESSAGE_HISTORY)) {
      if (keyCode === keyCodes.ArrowUp) {
        if (document.querySelector(AUTOCOMPLETE_SUGGESTIONS_SELECTOR) != null) return;
        if (twitch.getChatInputSelection() !== SelectionTypes.START) return;
        if (this.historyPos + 1 === this.messageHistory.length) return;

        const unsentMsg = chatInputValue.trim();
        if (this.historyPos < 0 && unsentMsg.length > 0) {
          this.messageHistory.unshift(unsentMsg);
          this.historyPos = 0;
        }

        const prevMsg = this.messageHistory[++this.historyPos];
        twitch.setChatInputValue(prevMsg);
      } else if (keyCode === keyCodes.ArrowDown) {
        if (document.querySelector(AUTOCOMPLETE_SUGGESTIONS_SELECTOR) != null) return;
        if (twitch.getChatInputSelection() !== SelectionTypes.END) return;
        if (this.historyPos > 0) {
          const prevMsg = this.messageHistory[--this.historyPos];
          twitch.setChatInputValue(prevMsg);
        } else {
          const draft = chatInputValue.trim();
          if (this.historyPos < 0 && draft.length > 0) {
            this.messageHistory.unshift(draft);
          }
          this.historyPos = -1;
          twitch.setChatInputValue('');
        }
      } else if (this.historyPos >= 0) {
        this.messageHistory[this.historyPos] = chatInputValue;
      }
    }
  };

  getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
    let userList = [];
    let emoteList = [];

    prefix = prefix.toLowerCase();

    if (includeEmotes) {
      const emoteSet = new Set();
      emotes.getEmotes().forEach(({code}) => {
        if (!normalizedStartsWith(code, prefix)) return;
        emoteSet.add(code);
      });
      this.getTwitchEmotes().forEach((code) => {
        if (!normalizedStartsWith(code, prefix)) return;
        emoteSet.add(code);
      });
      emoteList = Array.from(emoteSet);
      emoteList.sort((a, b) => a.localeCompare(b));
    }

    if (includeUsers) {
      userList = Array.from(this.userList).filter((word) => normalizedStartsWith(word, prefix));
      userList.sort((a, b) => a.localeCompare(b));
    }

    if (settings.get(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY) === true) {
      return [...emoteList, ...userList];
    }
    return [...userList, ...emoteList];
  }

  getTwitchEmotes() {
    try {
      return Object.keys(twitch.getCurrentEmotes().emoteMap);
    } catch (_) {
      return [];
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatTabcompletionModule()]);
