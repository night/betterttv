import React from 'react';
import Autocomplete from '../../../common/components/Autocomplete.jsx';
import {SettingIds, ShadowDOMComponentIds, UserLevels, COMMAND_PREFIX} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import shadowDom from '../../shadow_dom/index.js';
import CommandRow from '../components/CommandRow.jsx';
import useAuthStore from '../../../stores/auth.js';
import Fuse from 'fuse.js';
import {getAutocompleteSuggestions} from '../../../actions/autocomplete.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import watcher from '../../../watcher.js';
import {getProSettingValue} from '../../../utils/pro.js';
import {getYoutubeChatInputPartialCommand, setYoutubeChatInputValue} from '../../../utils/youtube.js';
import HTTPError from '../../../utils/http-error.js';

const CHAT_TEXT_AREA = '#input-container';

function getChatInputPartialCommand() {
  return getYoutubeChatInputPartialCommand(COMMAND_PREFIX);
}

const commandFuse = new Fuse([], {keys: ['name'], threshold: 0.2});

function getItemKey(item) {
  return `${item.provider}:${item.providerId}`;
}

function replaceChatInputPartialCommand(command) {
  setYoutubeChatInputValue(`${command.name} `);
}

let currentCommands = [];
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
    return commandFuse.search(partialInput).map(({item}) => item);
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
