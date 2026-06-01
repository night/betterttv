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
import CommandRow, {ArgumentDisplayTextByArgumentType} from '../components/CommandRow.jsx';
import useAuthStore from '../../../stores/auth.js';
import Fuse from 'fuse.js';
import {getAutocompleteSuggestions} from '../../../actions/autocomplete.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import watcher from '../../../watcher.js';
import {getProSettingValue} from '../../../utils/pro.js';
import gql from 'graphql-tag';
import {Editor, Transforms} from 'slate';
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

  const caret = twitch.getChatInputCaretOffset();
  if (caret == null) {
    return null;
  }

  const focusedWord = findFocusedWord(value, caret);
  const firstWord = value.split(' ')[0].trim();

  if (firstWord !== focusedWord) {
    return null;
  }

  if (!focusedWord.startsWith(COMMAND_PREFIX)) {
    return null;
  }

  return focusedWord;
}

const commandFuse = new Fuse([], {keys: ['name']});

function getItemKey(item) {
  return `${item.provider}:${item.providerId}`;
}

function replaceChatInputPartialCommand(command) {
  const firstArgument = command.arguments[0];

  if (firstArgument == null) {
    twitch.setChatInputValue(command.name);
    return;
  }

  const argumentDisplayText = ArgumentDisplayTextByArgumentType[firstArgument.type];
  const text = `${command.name} ${argumentDisplayText}`;

  twitch.setChatInputValue(text);

  const editor = twitch.getChatInputEditor();
  if (editor == null) {
    return;
  }

  // immitate twitch's behavior when an argument is present
  // selecting the argument after the command name

  requestAnimationFrame(() => {
    const anchor = Editor.point(editor, {
      path: [0, 0],
      offset: command.name.length + 1,
    });

    const focus = Editor.point(editor, {
      path: [0, 0],
      offset: text.length,
    });

    Transforms.select(editor, {anchor, focus});
  });
}

let currentCommands = [];
let fetchPromise = null;

class CommandAutocomplete {
  constructor() {
    this.dirty = true;
    this.load();

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.load()
    );

    watcher.on('channel.updated', () => this.markDirty());
    domObserver.on(CHAT_TEXT_AREA, () => this.renderAutocomplete());
    settings.on(`changed.${SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    this.renderAutocomplete();
    this.updateChannelCommandIndex();
  }

  async computeItems(partialInput) {
    if (this.dirty && fetchPromise == null) {
      fetchPromise = this.fetchChannelCommands()
        .then(() => (this.dirty = false))
        .finally(() => (fetchPromise = null));
    }

    if (fetchPromise != null) {
      await Promise.allSettled([fetchPromise]);
    }

    return commandFuse.search(partialInput).map(({item}) => item);
  }

  markDirty() {
    fetchPromise = null;
    this.dirty = true;
  }

  async fetchChannelCommands() {
    const currentChannel = getCurrentChannel();
    const commandAutocompleteEnabled = getProSettingValue(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE, false);

    if (!commandAutocompleteEnabled || currentChannel == null) {
      currentCommands = [];
      currentChatBots = [];

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

    const sortedSuggestions = filteredSuggestions.sort((a, b) => a.name.localeCompare(b.name));
    commandFuse.setCollection(sortedSuggestions);
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
