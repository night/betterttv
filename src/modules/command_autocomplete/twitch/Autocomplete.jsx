import React from 'react';
import Autocomplete from '../../../common/components/Autocomplete.jsx';
import {
  SettingIds,
  ShadowDOMComponentIds,
  UserLevelHierarchy,
  UserLevels,
  CommandProviders,
  COMMAND_PREFIX,
} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import shadowDom from '../../shadow_dom/index.js';
import twitch from '../../../utils/twitch.js';
import CommandRow from '../components/CommandRow.jsx';
import useAuthStore from '../../../stores/auth.js';
import {getAutocompleteSuggestions} from '../../../actions/autocomplete.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import watcher from '../../../watcher.js';
import {getProSettingValue} from '../../../utils/pro.js';
import gql from 'graphql-tag';
import HTTPError from '../../../utils/http-error.js';

const GET_CHANNEL_CHATBOTS = gql`
  query BTTVGetChannelChatbots($userId: ID!) {
    user(id: $userId) {
      channel {
        chatters {
          chatbots {
            login
          }
        }
      }
    }
  }
`;

// ensure all bot logins are lowercase
const BotLoginByCommandProvider = {
  [CommandProviders.NIGHTBOT]: 'nightbot',
  [CommandProviders.FOSSABOT]: 'fossabot',
  [CommandProviders.MOOBOT]: 'moobot',
  [CommandProviders.STREAMELEMENTS]: 'streamelements',
};

const CHAT_TEXT_AREA = '.chat-input__textarea, textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';

const eligibleChatBotLogins = Object.values(BotLoginByCommandProvider);

async function getChatBotList(channelId) {
  try {
    const {data} = await twitch.graphqlQuery(GET_CHANNEL_CHATBOTS, {userId: channelId});
    return data.user.channel.chatters.chatbots.map((bot) => bot.login.toLowerCase());
  } catch (error) {
    return eligibleChatBotLogins;
  }
}

function getCurrentUserLevel() {
  const currentChat = twitch.getCurrentChat();
  if (currentChat == null) {
    return UserLevels.EVERYONE;
  }

  const {isOwnChannel, isCurrentUserVIP, isCurrentUserModerator} = currentChat.props;
  if (isOwnChannel) {
    return UserLevels.OWNER;
  }

  if (isCurrentUserModerator) {
    return UserLevels.MODERATOR;
  }

  if (isCurrentUserVIP) {
    return UserLevels.TWITCH_VIP;
  }

  return UserLevels.EVERYONE;
}

function findFocusedWord(value, selectionStart = 0) {
  const subString = value.substring(0, selectionStart);
  const focusedWords = subString.split(/\s+/);
  const focusedWord = focusedWords[focusedWords.length - 1];
  return focusedWord;
}

function getChatInputPartialCommand() {
  const value = twitch.getChatInputValue();
  if (value == null) {
    return null;
  }

  if (!value.startsWith(COMMAND_PREFIX)) {
    return null;
  }

  const caret = twitch.getChatInputCaretOffset(value);
  if (caret == null) {
    return null;
  }

  const firstWord = value.trim().split(/\s+/)[0];
  if (caret > firstWord.length) {
    return null;
  }

  const focusedWord = findFocusedWord(value, caret);
  if (!focusedWord.startsWith(COMMAND_PREFIX)) {
    return null;
  }

  return focusedWord;
}

function normalizeCommandInput(input) {
  const normalizedInput = input.trim().toLowerCase();

  const searchTerm = normalizedInput.startsWith(COMMAND_PREFIX)
    ? normalizedInput.slice(COMMAND_PREFIX.length)
    : normalizedInput;

  return {normalizedInput, searchTerm};
}

function getMatchingCommands(commands, partialInput) {
  const {normalizedInput, searchTerm} = normalizeCommandInput(partialInput);
  if (normalizedInput.length === 0 || normalizedInput === COMMAND_PREFIX) {
    return commands;
  }

  if (searchTerm.length >= 3) {
    return commands.filter((command) => command.name.toLowerCase().slice(COMMAND_PREFIX.length).includes(searchTerm));
  }

  return commands.filter((command) => command.name.toLowerCase().startsWith(normalizedInput));
}

function getItemKey(item) {
  return `${item.provider}:${item.providerId}`;
}

function replaceChatInputPartialCommand(command) {
  twitch.setChatInputValue(`${command.name} `);
}

let currentCommands = [];
let sortedCommandIndex = [];
let fetchPromise = null;

let listener = null;

class CommandAutocomplete {
  constructor() {
    this.dirty = true;
    this.load();

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.load()
    );

    watcher.on('channel.updated', () => this.markDirty());

    domObserver.on(CHAT_TEXT_AREA, () => {
      this.renderAutocomplete();
      this.updateFocusListener();
    });

    settings.on(`changed.${SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    this.renderAutocomplete();
    this.updateChannelCommandIndex();
    this.updateFocusListener();
  }

  async ensureCommandsLoaded() {
    if (this.dirty && fetchPromise == null) {
      fetchPromise = this.fetchChannelCommands()
        .then(() => (this.dirty = false))
        .finally(() => (fetchPromise = null));
    }

    if (fetchPromise != null) {
      await Promise.allSettled([fetchPromise]);
    }

    return fetchPromise;
  }

  async computeItems(partialInput) {
    if (this.dirty) {
      await this.ensureCommandsLoaded();
    }

    return getMatchingCommands(sortedCommandIndex, partialInput);
  }

  markDirty() {
    fetchPromise = null;
    this.dirty = true;
    this.updateFocusListener();
  }

  updateFocusListener() {
    const chatInputElement = document.querySelector(CHAT_TEXT_AREA);
    if (chatInputElement == null) {
      return;
    }

    const commandAutocompleteEnabled = getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false);

    chatInputElement.removeEventListener('focus', listener, true);
    listener = null;

    if (!commandAutocompleteEnabled || !this.dirty) {
      return;
    }

    listener = this.ensureCommandsLoaded.bind(this);
    chatInputElement.addEventListener('focus', listener, true);
  }

  async fetchChannelCommands() {
    const currentChannel = getCurrentChannel();
    const commandAutocompleteEnabled = getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false);

    if (!commandAutocompleteEnabled || currentChannel == null) {
      currentCommands = [];

      this.updateChannelCommandIndex();
      return;
    }

    try {
      const chatBots = await getChatBotList(currentChannel.id);

      const validBotProviders = Object.entries(BotLoginByCommandProvider)
        .filter(([, botProvider]) => chatBots.includes(botProvider))
        .map(([commandProvider]) => commandProvider);

      const newCommands = await getAutocompleteSuggestions({
        provider: currentChannel.provider,
        providerId: currentChannel.id,
        requestedBotProviders: validBotProviders,
      });

      currentCommands = newCommands ?? [];
    } catch (error) {
      if (!(error instanceof HTTPError) || error.status !== 404) {
        throw error;
      }

      currentCommands = [];
    }

    this.updateChannelCommandIndex();
  }

  updateChannelCommandIndex() {
    const currentUserLevel = getCurrentUserLevel();

    const filteredSuggestions = currentCommands.filter((command) => {
      if (!command.name.startsWith(COMMAND_PREFIX)) {
        return false;
      }

      let isEligible = false;

      const currentUserLevelValue = UserLevelHierarchy[currentUserLevel];

      if (Array.isArray(command.userLevel)) {
        isEligible = command.userLevel.includes(currentUserLevel);
      } else {
        const commandUserLevelValue = UserLevelHierarchy[command.userLevel.toLowerCase()];
        isEligible = commandUserLevelValue <= currentUserLevelValue;
      }

      return isEligible;
    });

    sortedCommandIndex = filteredSuggestions.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderAutocomplete() {
    const commandAutocompleteEnabled = getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false);

    if (!commandAutocompleteEnabled) {
      shadowDom.unmount(ShadowDOMComponentIds.COMMAND_AUTOCOMPLETE);
      return;
    }

    if (shadowDom.isMounted(ShadowDOMComponentIds.COMMAND_AUTOCOMPLETE)) {
      return;
    }

    shadowDom.mount(
      ShadowDOMComponentIds.COMMAND_AUTOCOMPLETE,
      <Autocomplete
        offset={8}
        showKeyboardNavigationTips={false}
        fullWidthOnSmallScreens={false}
        chatInputQuerySelector={CHAT_TEXT_AREA}
        getChatInputPartialInput={getChatInputPartialCommand}
        computeItems={this.computeItems.bind(this)}
        getItemKey={getItemKey}
        onComplete={replaceChatInputPartialCommand}
        renderRow={(props) => <CommandRow {...props} />}
      />
    );
  }
}

export default CommandAutocomplete;
