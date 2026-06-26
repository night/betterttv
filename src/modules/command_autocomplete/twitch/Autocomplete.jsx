import React from 'react';
import Autocomplete from '@/common/components/Autocomplete';
import {
  SettingIds,
  ShadowDOMComponentIds,
  UserLevelHierarchy,
  UserLevels,
  CommandProviders,
  COMMAND_PREFIX,
  CommandAutocompleteArgumentTypes,
} from '@/constants';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import shadowDom from '@/modules/shadow_dom/index';
import twitch, {CHAT_INPUT} from '@/utils/twitch';
import CommandRow from '@/modules/command_autocomplete/components/CommandRow';
import useAuthStore from '@/stores/auth';
import {getAutocompleteSuggestions} from '@/actions/autocomplete';
import {getCurrentChannel} from '@/utils/channel';
import watcher from '@/watcher';
import {getProSettingValue} from '@/utils/pro';
import gql from 'graphql-tag';
import HTTPError from '@/utils/http-error';

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

function getChatInputPartialCommand() {
  const element = document.querySelector(CHAT_INPUT);
  if (element == null) {
    return null;
  }

  const value = twitch.getChatInputValue(element);

  if (value == null) {
    return null;
  }

  if (!value.startsWith(COMMAND_PREFIX)) {
    return null;
  }

  return value;
}

function getChatInputCaretPosition() {
  const element = document.querySelector(CHAT_INPUT);
  if (element == null) {
    return null;
  }

  return twitch.getChatInputCaretOffset(null, element);
}

function normalizeCommandInput(input) {
  const normalizedInput = input.toLowerCase();

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

  return commands.filter((command) => {
    const normalizedInputTrimmed = normalizedInput.toLowerCase();
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const normalizedCommandName = command.name.toLowerCase();

    if (normalizedCommandName.startsWith(normalizedInputTrimmed)) {
      return true;
    }

    const textAfterCommand = normalizedInputTrimmed.slice(normalizedCommandName.length);

    // Only treat the input as "command name followed by arguments" when a space
    // separates them. Without the boundary check, typing a longer command (e.g.
    // "!commands") would match a shorter one ("!c") by reading the remaining
    // characters ("ommands") as that command's argument.
    if (normalizedInputTrimmed.startsWith(normalizedCommandName) && textAfterCommand.startsWith(' ')) {
      if (command.arguments.some((argument) => argument.type === CommandAutocompleteArgumentTypes.PHRASE)) {
        return true;
      }

      const textArgumentCount = textAfterCommand.trimStart().split(/\s+/).length;
      const commandArgumentCount = command.arguments?.length ?? 0;

      if (textArgumentCount <= commandArgumentCount) {
        return true;
      }
    }

    return normalizedCommandName.includes(normalizedSearchTerm);
  });
}

function getItemKey(item) {
  return `${item.provider}:${item.providerId}`;
}

function replaceChatInputPartialCommand(command) {
  const newValue = `${command.name} `;
  twitch.setChatInputValue(newValue);
  return {newValue, shouldClose: command.arguments?.length === 0};
}

function getCommandNameLength(command) {
  if (command?.name == null) {
    return null;
  }
  return command.name.length;
}

// Tab past the command name adds a space to advance to the next argument —
// unless the caret is in a phrase argument, which soaks up the rest of the
// message (always the last argument) and owns its own spacing.
function appendChatInputSpace(command, caretPosition) {
  const value = getChatInputPartialCommand();
  if (value == null || value.endsWith(' ')) {
    return;
  }

  const args = command.arguments ?? [];
  const argumentIndex = value.slice(command.name.length, caretPosition).trim().split(/\s+/).length - 1;
  const focusedArgument = args[Math.min(argumentIndex, args.length - 1)];
  if (focusedArgument?.type === CommandAutocompleteArgumentTypes.PHRASE) {
    return;
  }

  twitch.setChatInputValue(`${value} `);
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
        getCompletionLength={getCommandNameLength}
        onAppendSpace={appendChatInputSpace}
        chatInputQuerySelector={CHAT_TEXT_AREA}
        getChatInputPartialInput={getChatInputPartialCommand}
        getChatInputCaretPosition={getChatInputCaretPosition}
        computeItems={this.computeItems.bind(this)}
        getItemKey={getItemKey}
        handleCompleteResult={replaceChatInputPartialCommand}
        renderRow={(props) => <CommandRow {...props} />}
      />
    );
  }
}

export default CommandAutocomplete;
