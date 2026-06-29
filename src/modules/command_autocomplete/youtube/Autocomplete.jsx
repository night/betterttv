import React from 'react';
import {getAutocompleteSuggestions} from '@/actions/autocomplete';
import Autocomplete from '@/common/components/Autocomplete';
import {
  SettingIds,
  ShadowDOMComponentIds,
  UserLevels,
  COMMAND_PREFIX,
  CommandAutocompleteArgumentTypes,
} from '@/constants';
import CommandRow from '@/modules/command_autocomplete/components/CommandRow';
import shadowDom from '@/modules/shadow_dom/index';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import useAuthStore from '@/stores/auth';
import {getCurrentChannel} from '@/utils/channel';
import HTTPError from '@/utils/http-error';
import {getProSettingValue} from '@/utils/pro';
import {
  getCaretOffsetInContentEditable,
  getYoutubeChatInputPartialCommand,
  setYoutubeChatInputValue,
  YOUTUBE_CHAT_CONTENTEDITABLE_SELECTOR,
} from '@/utils/youtube';
import watcher from '@/watcher';

const CHAT_TEXT_AREA = '#input-container';

function getChatInputPartialCommand() {
  return getYoutubeChatInputPartialCommand(COMMAND_PREFIX);
}

function getChatInputCaretPosition() {
  const element = document.querySelector(YOUTUBE_CHAT_CONTENTEDITABLE_SELECTOR);
  if (element == null) {
    return null;
  }

  return getCaretOffsetInContentEditable(element);
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

    if (normalizedInputTrimmed.startsWith(normalizedCommandName)) {
      if (command.arguments.some((argument) => argument.type === CommandAutocompleteArgumentTypes.PHRASE)) {
        return true;
      }

      const textAfterCommand = normalizedInputTrimmed.slice(normalizedCommandName.length);
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
  setYoutubeChatInputValue(newValue);
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

  setYoutubeChatInputValue(`${value} `);
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
    await this.ensureCommandsLoaded();
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

    if (!commandAutocompleteEnabled || !this.dirty) {
      chatInputElement.removeEventListener('focus', listener, true);
      listener = null;
    } else {
      listener = this.ensureCommandsLoaded.bind(this);
      chatInputElement.addEventListener('focus', listener, true);
    }
  }

  async fetchChannelCommands() {
    const currentChannel = getCurrentChannel();
    const commandAutocompleteEnabled = getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false);

    if (!commandAutocompleteEnabled || currentChannel == null) {
      currentCommands = [];

      this.updateChannelCommandIndex();
      return;
    }

    // TODO: guard for channel is live and a chatbot is in chat

    try {
      const newCommands = await getAutocompleteSuggestions({
        provider: currentChannel.provider,
        providerId: currentChannel.id,
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
    const filteredSuggestions = currentCommands.filter((command) => {
      if (!command.name.startsWith(COMMAND_PREFIX)) {
        return false;
      }

      // TODO: determine youtube current user level

      if (Array.isArray(command.userLevel)) {
        return command.userLevel.includes(UserLevels.EVERYONE);
      }

      return command.userLevel === UserLevels.EVERYONE;
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
